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
    confirmedBy: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
        employee: "employee";
        system: "system";
    }>>>;
    locationId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    locationName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    punchStatus: z.ZodDefault<z.ZodEnum<{
        none: "none";
        open: "open";
        closed: "closed";
        no_show: "no_show";
    }>>;
    late: z.ZodDefault<z.ZodBoolean>;
    plannedStartTime: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    plannedEndTime: z.ZodDefault<z.ZodNullable<z.ZodString>>;
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
    confirmedBy: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
        employee: "employee";
        system: "system";
    }>>>;
    locationId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    locationName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    punchStatus: z.ZodDefault<z.ZodEnum<{
        none: "none";
        open: "open";
        closed: "closed";
        no_show: "no_show";
    }>>;
    late: z.ZodDefault<z.ZodBoolean>;
    plannedStartTime: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    plannedEndTime: z.ZodDefault<z.ZodNullable<z.ZodString>>;
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
    no_show: "no_show";
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
        no_show: "no_show";
        out: "out";
        in: "in";
        break_start: "break_start";
        break_end: "break_end";
    }>;
    occurredAt: z.ZodString;
    shiftAssignmentId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    breakLimitMinutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
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
        no_show: "no_show";
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
    breakLimitMinutes: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
declare const clockEventsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        no_show: "no_show";
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
    breakLimitMinutes: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>>;
type ClockEvent = z.infer<typeof clockEventSchema>;

/** Max size for a chat attachment, enforced client-side before upload. */
declare const CHAT_MAX_ATTACHMENT_BYTES: number;
/** Attachments are images only (for now). MIME types accepted. */
declare const CHAT_ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
/**
 * Structured payload authored by the in-app scheduling assistant. Rendered by
 * the chat UI instead of a plain bubble. Discriminated on `kind`. All display
 * strings arrive already localized by the backend (manager's locale); `value`
 * fields are stable tokens sent back verbatim as the next user message when a
 * chip/button is tapped. The message's `content` always carries a plain-text
 * fallback so push and payload-unaware clients degrade gracefully.
 *
 * NOTE: the backend does NOT consume @ai-scheduling/shared — it mirrors this
 * shape in its own TS type. Keep both in sync (see AssistantPayload backend).
 */
declare const botOptionSchema: z.ZodObject<{
    label: z.ZodString;
    value: z.ZodString;
}, z.core.$strip>;
type BotOption = z.infer<typeof botOptionSchema>;
declare const botSkippedSchema: z.ZodObject<{
    employeeId: z.ZodString;
    employeeName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    date: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
declare const botPayloadSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"text">;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"options">;
    question: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"confirm">;
    title: z.ZodString;
    lines: z.ZodDefault<z.ZodArray<z.ZodString>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
    confirmLabel: z.ZodString;
    cancelLabel: z.ZodString;
    confirmValue: z.ZodString;
    cancelValue: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"progress">;
    state: z.ZodEnum<{
        queued: "queued";
        generating: "generating";
    }>;
    label: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"result">;
    title: z.ZodString;
    success: z.ZodDefault<z.ZodBoolean>;
    created: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    replaced: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    skipped: z.ZodDefault<z.ZodArray<z.ZodObject<{
        employeeId: z.ZodString;
        employeeName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        date: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strip>>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
    link: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>], "kind">;
type BotPayload = z.infer<typeof botPayloadSchema>;
/** A chat message (GET /chat/rooms/:id/messages items, POST send response). */
declare const chatMessageSchema: z.ZodObject<{
    id: z.ZodString;
    roomId: z.ZodString;
    senderId: z.ZodNullable<z.ZodString>;
    senderName: z.ZodNullable<z.ZodString>;
    senderType: z.ZodDefault<z.ZodEnum<{
        user: "user";
        assistant: "assistant";
    }>>;
    content: z.ZodString;
    createdAt: z.ZodString;
    attachmentUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    attachmentType: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
        file: "file";
        image: "image";
    }>>>;
    attachmentName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    botPayload: z.ZodDefault<z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"text">;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"options">;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"confirm">;
        title: z.ZodString;
        lines: z.ZodDefault<z.ZodArray<z.ZodString>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
        confirmLabel: z.ZodString;
        cancelLabel: z.ZodString;
        confirmValue: z.ZodString;
        cancelValue: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"progress">;
        state: z.ZodEnum<{
            queued: "queued";
            generating: "generating";
        }>;
        label: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"result">;
        title: z.ZodString;
        success: z.ZodDefault<z.ZodBoolean>;
        created: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
        replaced: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
        skipped: z.ZodDefault<z.ZodArray<z.ZodObject<{
            employeeId: z.ZodString;
            employeeName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
            date: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strip>>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
        link: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>], "kind">>>;
    replyTo: z.ZodDefault<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        senderName: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>>;
    editedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    deletedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    reactions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        emoji: z.ZodString;
        count: z.ZodNumber;
        mine: z.ZodBoolean;
    }, z.core.$strip>>>;
}, z.core.$strip>;
type ChatMessage = z.infer<typeof chatMessageSchema>;
/** POST /chat/rooms/:id/messages/:msgId/reactions body — toggles the emoji. */
declare const reactionInputSchema: z.ZodObject<{
    emoji: z.ZodString;
}, z.core.$strip>;
type ReactionInput = z.infer<typeof reactionInputSchema>;
/** Curated quick-react set (WhatsApp-style). */
declare const CHAT_QUICK_REACTIONS: readonly ["👍", "❤️", "😂", "😮", "😢", "🙏"];
/** A coworker to start a chat with (GET /chat/contacts). */
declare const chatContactSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
type ChatContact = z.infer<typeof chatContactSchema>;
/** A group member (GET /chat/rooms/:id/members). */
declare const chatMemberSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
        member: "member";
        admin: "admin";
    }>;
}, z.core.$strip>;
type ChatMember = z.infer<typeof chatMemberSchema>;
/** A room in the user's chat list (GET /chat/rooms). */
declare const chatRoomSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        assistant: "assistant";
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
    botValue: z.ZodOptional<z.ZodString>;
    replyToId: z.ZodOptional<z.ZodString>;
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
        senderType: z.ZodDefault<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>>;
        content: z.ZodString;
        createdAt: z.ZodString;
        attachmentUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        attachmentType: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
            file: "file";
            image: "image";
        }>>>;
        attachmentName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        botPayload: z.ZodDefault<z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"text">;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"options">;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"confirm">;
            title: z.ZodString;
            lines: z.ZodDefault<z.ZodArray<z.ZodString>>;
            warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
            confirmLabel: z.ZodString;
            cancelLabel: z.ZodString;
            confirmValue: z.ZodString;
            cancelValue: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"progress">;
            state: z.ZodEnum<{
                queued: "queued";
                generating: "generating";
            }>;
            label: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"result">;
            title: z.ZodString;
            success: z.ZodDefault<z.ZodBoolean>;
            created: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
            replaced: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
            skipped: z.ZodDefault<z.ZodArray<z.ZodObject<{
                employeeId: z.ZodString;
                employeeName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
                date: z.ZodString;
                reason: z.ZodString;
            }, z.core.$strip>>>;
            warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
            link: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>], "kind">>>;
        replyTo: z.ZodDefault<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            senderName: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>>;
        editedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        deletedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        reactions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            count: z.ZodNumber;
            mine: z.ZodBoolean;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type ChatMessageCreatedEvent = z.infer<typeof chatMessageCreatedEventSchema>;
/** Socket payload for 'ChatMessageUpdated' (edit / delete). */
declare const chatMessageUpdatedEventSchema: z.ZodObject<{
    roomId: z.ZodString;
    message: z.ZodObject<{
        id: z.ZodString;
        roomId: z.ZodString;
        senderId: z.ZodNullable<z.ZodString>;
        senderName: z.ZodNullable<z.ZodString>;
        senderType: z.ZodDefault<z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>>;
        content: z.ZodString;
        createdAt: z.ZodString;
        attachmentUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        attachmentType: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
            file: "file";
            image: "image";
        }>>>;
        attachmentName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        botPayload: z.ZodDefault<z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"text">;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"options">;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"confirm">;
            title: z.ZodString;
            lines: z.ZodDefault<z.ZodArray<z.ZodString>>;
            warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
            confirmLabel: z.ZodString;
            cancelLabel: z.ZodString;
            confirmValue: z.ZodString;
            cancelValue: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"progress">;
            state: z.ZodEnum<{
                queued: "queued";
                generating: "generating";
            }>;
            label: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"result">;
            title: z.ZodString;
            success: z.ZodDefault<z.ZodBoolean>;
            created: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
            replaced: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
            skipped: z.ZodDefault<z.ZodArray<z.ZodObject<{
                employeeId: z.ZodString;
                employeeName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
                date: z.ZodString;
                reason: z.ZodString;
            }, z.core.$strip>>>;
            warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
            link: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>], "kind">>>;
        replyTo: z.ZodDefault<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            senderName: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>>;
        editedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        deletedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        reactions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            count: z.ZodNumber;
            mine: z.ZodBoolean;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type ChatMessageUpdatedEvent = z.infer<typeof chatMessageUpdatedEventSchema>;
/** Socket payload for the 'ChatTyping' event. */
declare const chatTypingEventSchema: z.ZodObject<{
    roomId: z.ZodString;
    employeeId: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
type ChatTypingEvent = z.infer<typeof chatTypingEventSchema>;
/** A member's read cursor (GET /chat/rooms/:id/reads). */
declare const chatReadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    lastReadAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type ChatRead = z.infer<typeof chatReadSchema>;
/** Socket payload for the 'ChatRead' event (someone read a room). */
declare const chatReadEventSchema: z.ZodObject<{
    roomId: z.ZodString;
    employeeId: z.ZodString;
    lastReadAt: z.ZodString;
}, z.core.$strip>;
type ChatReadEvent = z.infer<typeof chatReadEventSchema>;

/** POST /push/register body. */
declare const registerDeviceInputSchema: z.ZodObject<{
    token: z.ZodString;
    platform: z.ZodEnum<{
        ios: "ios";
        android: "android";
    }>;
}, z.core.$strip>;
type RegisterDeviceInput = z.infer<typeof registerDeviceInputSchema>;

export { type BotOption, type BotPayload, CHAT_ALLOWED_IMAGE_TYPES, CHAT_MAX_ATTACHMENT_BYTES, CHAT_QUICK_REACTIONS, type ChatContact, type ChatMember, type ChatMessage, type ChatMessageCreatedEvent, type ChatMessageUpdatedEvent, type ChatRead, type ChatReadEvent, type ChatRoom, type ChatTypingEvent, type ClockEvent, type ClockEventType, type ClockValidationStatus, type CreateClockEventInput, type CreateRoomInput, type GeoLocation, type MyLocations, type MyProfile, type ReactionInput, type RegisterDeviceInput, type ScheduleAssignment, type ScheduleAssignmentBreak, type SendMessageInput, botOptionSchema, botPayloadSchema, botSkippedSchema, chatContactSchema, chatMemberSchema, chatMessageCreatedEventSchema, chatMessageSchema, chatMessageUpdatedEventSchema, chatReadEventSchema, chatReadSchema, chatRoomSchema, chatTypingEventSchema, clockEventSchema, clockEventTypeSchema, clockEventsSchema, clockGpsSchema, clockValidationStatusSchema, createClockEventInputSchema, createRoomInputSchema, geoLocationSchema, myLocationsSchema, myProfileSchema, reactionInputSchema, registerDeviceInputSchema, scheduleAssignmentBreakSchema, scheduleAssignmentSchema, scheduleAssignmentsSchema, sendMessageInputSchema };
