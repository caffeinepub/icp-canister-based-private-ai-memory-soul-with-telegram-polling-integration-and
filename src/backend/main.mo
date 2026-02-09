import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    telegramUsername : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Thread = {
    id : Text;
    title : Text;
    participants : [Text];
    timestamp_created : Time.Time;
    timestamp_modified : Time.Time;
    owner : Principal;
  };

  public type EventType = {
    #text;
    #telegramMessage;
    #action;
  };

  public type Event = {
    id : Text;
    threadId : Text;
    timestamp : Time.Time;
    sender : Text;
    eventType : EventType;
    content : Text;
    metadata : Text;
  };

  let threads = Map.empty<Text, Thread>();
  let events = Map.empty<Text, Event>();

  module Thread {
    public func compareByTimestampModified(thread1 : Thread, thread2 : Thread) : Order.Order {
      Int.compare(thread1.timestamp_modified, thread2.timestamp_modified);
    };
  };

  module Event {
    public func compareByTimestamp(event1 : Event, event2 : Event) : Order.Order {
      Int.compare(event1.timestamp, event2.timestamp);
    };
  };

  // Helper function to check thread ownership or admin
  private func canAccessThread(caller : Principal, thread : Thread) : Bool {
    caller == thread.owner or AccessControl.isAdmin(accessControlState, caller);
  };

  // CRUD operations for threads
  public shared ({ caller }) func createThread(title : Text, participants : [Text]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create threads");
    };

    if (participants.size() == 1 and participants[0] == "system") {
      if (not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: Only admins can create system threads");
      };
    };

    let timestamp = Time.now();
    let threadId = timestamp.toText();
    let thread : Thread = {
      id = threadId;
      title;
      participants;
      timestamp_created = timestamp;
      timestamp_modified = timestamp;
      owner = caller;
    };
    threads.add(threadId, thread);

    threadId;
  };

  public shared ({ caller }) func updateThread(threadId : Text, title : Text, participants : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update threads");
    };

    let thread = threads.get(threadId);
    switch (thread) {
      case (null) { Runtime.trap("Thread not found") };
      case (?thread) {
        if (not canAccessThread(caller, thread)) {
          Runtime.trap("Unauthorized: Only thread owner or admin can update thread");
        };

        let updatedThread : Thread = {
          id = thread.id;
          title;
          participants;
          timestamp_created = thread.timestamp_created;
          timestamp_modified = Time.now();
          owner = thread.owner;
        };
        threads.add(threadId, updatedThread);
      };
    };
  };

  public shared ({ caller }) func deleteThread(threadId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete threads");
    };

    let threadOpt = threads.get(threadId);
    switch (threadOpt) {
      case (null) { Runtime.trap("Thread does not exist") };
      case (?thread) {
        if (not canAccessThread(caller, thread)) {
          Runtime.trap("Unauthorized: Only thread owner or admin can delete thread");
        };

        if (thread.participants.size() == 1 and thread.participants[0] == "system") {
          if (not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Only admins can delete system threads");
          };
        };
      };
    };
    threads.remove(threadId);
  };

  // CRUD operations for events
  public shared ({ caller }) func addEvent(threadId : Text, sender : Text, eventType : EventType, content : Text, metadata : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add events");
    };

    let threadOpt = threads.get(threadId);
    switch (threadOpt) {
      case (null) { Runtime.trap("Thread does not exist") };
      case (?thread) {
        if (not canAccessThread(caller, thread)) {
          Runtime.trap("Unauthorized: Only thread owner or admin can add events");
        };
      };
    };

    let timestamp = Time.now();
    let eventId = timestamp.toText();
    let event : Event = {
      id = eventId;
      threadId;
      timestamp;
      sender;
      eventType;
      content;
      metadata;
    };

    events.add(eventId, event);

    // Update thread's timestamp_modified
    switch (threads.get(threadId)) {
      case (null) {};
      case (?thread) {
        let updatedThread : Thread = {
          id = thread.id;
          title = thread.title;
          participants = thread.participants;
          timestamp_created = thread.timestamp_created;
          timestamp_modified = timestamp;
          owner = thread.owner;
        };
        threads.add(threadId, updatedThread);
      };
    };

    eventId;
  };

  public shared ({ caller }) func deleteEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete events");
    };

    switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?event) {
        // Check thread ownership
        switch (threads.get(event.threadId)) {
          case (null) { Runtime.trap("Thread not found") };
          case (?thread) {
            if (not canAccessThread(caller, thread)) {
              Runtime.trap("Unauthorized: Only thread owner or admin can delete events");
            };
          };
        };

        if (event.eventType == #telegramMessage and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can delete Telegram message events");
        };
      };
    };
    events.remove(eventId);
  };

  // Query functions
  public query ({ caller }) func getThread(threadId : Text) : async ?Thread {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view threads");
    };

    let threadOpt = threads.get(threadId);
    switch (threadOpt) {
      case (null) { null };
      case (?thread) {
        if (not canAccessThread(caller, thread)) {
          Runtime.trap("Unauthorized: Only thread owner or admin can view thread");
        };
        ?thread;
      };
    };
  };

  public query ({ caller }) func getAllThreads() : async [Thread] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view threads");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = threads.values().toArray().filter(
      func(thread : Thread) : Bool {
        isAdmin or thread.owner == caller;
      }
    );
    filtered.sort(Thread.compareByTimestampModified);
  };

  public query ({ caller }) func getEventsByThread(threadId : Text) : async [Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };

    let threadOpt = threads.get(threadId);
    switch (threadOpt) {
      case (null) { Runtime.trap("Thread not found") };
      case (?thread) {
        if (not canAccessThread(caller, thread)) {
          Runtime.trap("Unauthorized: Only thread owner or admin can view events");
        };
      };
    };

    let filtered = events.values().toArray().filter(func(event) { event.threadId == threadId });
    filtered.sort(Event.compareByTimestamp);
  };

  public query ({ caller }) func getEvent(eventId : Text) : async ?Event {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };

    let eventOpt = events.get(eventId);
    switch (eventOpt) {
      case (null) { null };
      case (?event) {
        switch (threads.get(event.threadId)) {
          case (null) { null };
          case (?thread) {
            if (not canAccessThread(caller, thread)) {
              Runtime.trap("Unauthorized: Only thread owner or admin can view event");
            };
            ?event;
          };
        };
      };
    };
  };

  // Delete all events of a thread
  public shared ({ caller }) func deleteThreadEvents(threadId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete thread events");
    };

    let threadOpt = threads.get(threadId);
    switch (threadOpt) {
      case (null) { Runtime.trap("Thread not found") };
      case (?thread) {
        if (not canAccessThread(caller, thread)) {
          Runtime.trap("Unauthorized: Only thread owner or admin can delete thread events");
        };
      };
    };

    let filtered = events.filter(func(_id, event) { event.threadId != threadId });

    events.clear();
    for ((k, v) in filtered.entries()) {
      events.add(k, v);
    };
  };

  // Delete all threads and events - Admin only
  public shared ({ caller }) func deleteAll() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete all data");
    };

    threads.clear();
    events.clear();
  };

  // Get all Threads with their Events
  public query ({ caller }) func getAllThreadsWithEvents() : async [(Thread, [Event])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view threads with events");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    threads.entries().toArray().filter(
      func((id, thread)) : Bool {
        isAdmin or thread.owner == caller;
      }
    ).map(
      func((id, thread)) {
        let threadEvents = events.toArray().filter(
          func((eventId, event)) { event.threadId == id }
        ).map(func((eventId, event)) { event });
        (thread, threadEvents);
      }
    );
  };

  // Outcall Example - Admin only for security
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func makeGetOutcall(url : Text) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can make HTTP outcalls");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };

  public type MessageBody = {
    id : Text;
    role : {
      first : Text;
      second : {
        None : {};
      };
    };
    content : {
      first : Text;
      second : {
        None : {};
      };
    };
    created_at : {
      first : Int;
      second : {
        None : {};
      };
    };
  };
};
