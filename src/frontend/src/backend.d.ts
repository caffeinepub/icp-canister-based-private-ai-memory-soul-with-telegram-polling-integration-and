import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Thread {
    id: string;
    title: string;
    participants: Array<string>;
    owner: Principal;
    timestamp_created: Time;
    timestamp_modified: Time;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Event {
    id: string;
    content: string;
    metadata: string;
    sender: string;
    timestamp: Time;
    threadId: string;
    eventType: EventType;
}
export interface UserProfile {
    telegramUsername?: string;
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum EventType {
    action = "action",
    text = "text",
    telegramMessage = "telegramMessage"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEvent(threadId: string, sender: string, eventType: EventType, content: string, metadata: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createThread(title: string, participants: Array<string>): Promise<string>;
    deleteAll(): Promise<void>;
    deleteEvent(eventId: string): Promise<void>;
    deleteThread(threadId: string): Promise<void>;
    deleteThreadEvents(threadId: string): Promise<void>;
    getAllThreads(): Promise<Array<Thread>>;
    getAllThreadsWithEvents(): Promise<Array<[Thread, Array<Event>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(eventId: string): Promise<Event | null>;
    getEventsByThread(threadId: string): Promise<Array<Event>>;
    getThread(threadId: string): Promise<Thread | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeGetOutcall(url: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateThread(threadId: string, title: string, participants: Array<string>): Promise<void>;
}
