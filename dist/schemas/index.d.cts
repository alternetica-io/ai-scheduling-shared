import { z } from 'zod';

/**
 * Mirrors the orchestrator's CompanyScheduleAssignmentDTO
 * (src/application/handlers/get-company-schedule.handler.ts). Returned by
 * GET /schedules and GET /employees/me/schedule. Times are ISO UTC; `date`
 * is the logical YYYY-MM-DD slot date.
 */
declare const scheduleAssignmentBreakSchema: z.ZodObject<{
    id: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    isPaid: z.ZodBoolean;
}, z.core.$strip>;
declare const scheduleAssignmentSchema: z.ZodObject<{
    id: z.ZodString;
    employeeId: z.ZodString;
    templateId: z.ZodString;
    templateName: z.ZodString;
    date: z.ZodString;
    actualStartTime: z.ZodString;
    actualEndTime: z.ZodString;
    origin: z.ZodEnum<{
        membership: "membership";
        override: "override";
        exception: "exception";
    }>;
    breaks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        startTime: z.ZodString;
        endTime: z.ZodString;
        isPaid: z.ZodBoolean;
    }, z.core.$strip>>;
    confirmedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const scheduleAssignmentsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    employeeId: z.ZodString;
    templateId: z.ZodString;
    templateName: z.ZodString;
    date: z.ZodString;
    actualStartTime: z.ZodString;
    actualEndTime: z.ZodString;
    origin: z.ZodEnum<{
        membership: "membership";
        override: "override";
        exception: "exception";
    }>;
    breaks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        startTime: z.ZodString;
        endTime: z.ZodString;
        isPaid: z.ZodBoolean;
    }, z.core.$strip>>;
    confirmedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>>;
type ScheduleAssignmentBreak = z.infer<typeof scheduleAssignmentBreakSchema>;
type ScheduleAssignment = z.infer<typeof scheduleAssignmentSchema>;
/** Mirrors GET /employees/me. */
declare const myProfileSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    role: z.ZodNullable<z.ZodString>;
    phone: z.ZodNullable<z.ZodString>;
    departmentId: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
    companyName: z.ZodNullable<z.ZodString>;
    timezone: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type MyProfile = z.infer<typeof myProfileSchema>;

/** Mirrors the orchestrator timeclock controller (Sprint 2, GPS + selfie). */
declare const clockEventTypeSchema: z.ZodEnum<{
    out: "out";
    in: "in";
    break_start: "break_start";
    break_end: "break_end";
}>;
type ClockEventType = z.infer<typeof clockEventTypeSchema>;
declare const clockGpsSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    accuracy: z.ZodNumber;
    photoUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** POST /timeclock/events body. */
declare const createClockEventInputSchema: z.ZodObject<{
    clientUuid: z.ZodString;
    type: z.ZodEnum<{
        out: "out";
        in: "in";
        break_start: "break_start";
        break_end: "break_end";
    }>;
    occurredAt: z.ZodString;
    shiftAssignmentId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    gps: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        accuracy: z.ZodNumber;
        photoUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
type CreateClockEventInput = z.infer<typeof createClockEventInputSchema>;
/** A location with its geofence (GET /employees/me/locations items). */
declare const geoLocationSchema: z.ZodObject<{
    id: z.ZodString;
    branchId: z.ZodString;
    name: z.ZodString;
    geofenceLat: z.ZodNumber;
    geofenceLng: z.ZodNumber;
    geofenceRadiusM: z.ZodNumber;
}, z.core.$strip>;
type GeoLocation = z.infer<typeof geoLocationSchema>;
/** GET /employees/me/locations — the employee's allowed locations + mode. */
declare const myLocationsSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        fixed: "fixed";
        rotate: "rotate";
    }>;
    locations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        branchId: z.ZodString;
        name: z.ZodString;
        geofenceLat: z.ZodNumber;
        geofenceLng: z.ZodNumber;
        geofenceRadiusM: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
type MyLocations = z.infer<typeof myLocationsSchema>;
declare const clockValidationStatusSchema: z.ZodEnum<{
    valid: "valid";
    pending_review: "pending_review";
    disputed: "disputed";
}>;
type ClockValidationStatus = z.infer<typeof clockValidationStatusSchema>;
/** Timeclock event as returned by the API. */
declare const clockEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        out: "out";
        in: "in";
        break_start: "break_start";
        break_end: "break_end";
    }>;
    source: z.ZodString;
    occurredAt: z.ZodString;
    recordedAt: z.ZodString;
    validationStatus: z.ZodEnum<{
        valid: "valid";
        pending_review: "pending_review";
        disputed: "disputed";
    }>;
    anomalyReason: z.ZodNullable<z.ZodString>;
    shiftAssignmentId: z.ZodNullable<z.ZodString>;
    lat: z.ZodNullable<z.ZodNumber>;
    lng: z.ZodNullable<z.ZodNumber>;
    accuracy: z.ZodNullable<z.ZodNumber>;
    photoUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const clockEventsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        out: "out";
        in: "in";
        break_start: "break_start";
        break_end: "break_end";
    }>;
    source: z.ZodString;
    occurredAt: z.ZodString;
    recordedAt: z.ZodString;
    validationStatus: z.ZodEnum<{
        valid: "valid";
        pending_review: "pending_review";
        disputed: "disputed";
    }>;
    anomalyReason: z.ZodNullable<z.ZodString>;
    shiftAssignmentId: z.ZodNullable<z.ZodString>;
    lat: z.ZodNullable<z.ZodNumber>;
    lng: z.ZodNullable<z.ZodNumber>;
    accuracy: z.ZodNullable<z.ZodNumber>;
    photoUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>>;
type ClockEvent = z.infer<typeof clockEventSchema>;

/** A chat message (GET /chat/rooms/:id/messages items, POST send response). */
declare const chatMessageSchema: z.ZodObject<{
    id: z.ZodString;
    roomId: z.ZodString;
    senderId: z.ZodNullable<z.ZodString>;
    senderName: z.ZodNullable<z.ZodString>;
    content: z.ZodString;
    createdAt: z.ZodString;
    attachmentUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    attachmentType: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
        file: "file";
        image: "image";
    }>>>;
    attachmentName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
type ChatMessage = z.infer<typeof chatMessageSchema>;
/** A coworker to start a chat with (GET /chat/contacts). */
declare const chatContactSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
type ChatContact = z.infer<typeof chatContactSchema>;
/** A room in the user's chat list (GET /chat/rooms). */
declare const chatRoomSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        dm: "dm";
        group: "group";
    }>;
    title: z.ZodString;
    memberCount: z.ZodNumber;
    lastMessage: z.ZodNullable<z.ZodObject<{
        content: z.ZodString;
        createdAt: z.ZodString;
        senderName: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    unreadCount: z.ZodNumber;
    updatedAt: z.ZodString;
}, z.core.$strip>;
type ChatRoom = z.infer<typeof chatRoomSchema>;
/** POST /chat/rooms/:id/messages body. */
declare const sendMessageInputSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    clientUuid: z.ZodOptional<z.ZodString>;
    attachmentPath: z.ZodOptional<z.ZodString>;
    attachmentType: z.ZodOptional<z.ZodEnum<{
        file: "file";
        image: "image";
    }>>;
    attachmentName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type SendMessageInput = z.infer<typeof sendMessageInputSchema>;
/** POST /chat/rooms body — create a group or ensure a dm. */
declare const createRoomInputSchema: z.ZodObject<{
    type: z.ZodEnum<{
        dm: "dm";
        group: "group";
    }>;
    memberId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
/** Socket payload for the 'ChatMessageCreated' event. */
declare const chatMessageCreatedEventSchema: z.ZodObject<{
    roomId: z.ZodString;
    message: z.ZodObject<{
        id: z.ZodString;
        roomId: z.ZodString;
        senderId: z.ZodNullable<z.ZodString>;
        senderName: z.ZodNullable<z.ZodString>;
        content: z.ZodString;
        createdAt: z.ZodString;
        attachmentUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        attachmentType: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
            file: "file";
            image: "image";
        }>>>;
        attachmentName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type ChatMessageCreatedEvent = z.infer<typeof chatMessageCreatedEventSchema>;
/** Socket payload for the 'ChatTyping' event. */
declare const chatTypingEventSchema: z.ZodObject<{
    roomId: z.ZodString;
    employeeId: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
type ChatTypingEvent = z.infer<typeof chatTypingEventSchema>;

export { type ChatContact, type ChatMessage, type ChatMessageCreatedEvent, type ChatRoom, type ChatTypingEvent, type ClockEvent, type ClockEventType, type ClockValidationStatus, type CreateClockEventInput, type CreateRoomInput, type GeoLocation, type MyLocations, type MyProfile, type ScheduleAssignment, type ScheduleAssignmentBreak, type SendMessageInput, chatContactSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatRoomSchema, chatTypingEventSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema };
