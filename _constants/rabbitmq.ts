import { AllOutbox, DeadLetterOptions, PriorityLevelMap, QueueOptions, UserCreatedType } from "@Types/events/OutboxEvents";
import { ms } from "ms";

const priority:PriorityLevelMap = {
  "no-priority": 0,
  "background": 1,
  "low":3,
  "normal": 5,
  "hight": 7,
  "urgent": 9,
  "critical": 10
}

export const QUEUE_OPTIONS = (options?:QueueOptions) => {
  const {durable = true, maxLength = 1000, messageTtl = ms("3m"), queueMode = "default", maxPriority, expires, deadLetterExchange, deadLetterRoutingKey} = options ?? {};
  return {
    durable, 
    maxPriority: maxPriority ? priority[maxPriority] : priority["no-priority"],
    arguments: {"x-queue-mode": queueMode},
    messageTtl,
    maxLength,
    ...(deadLetterExchange && {deadLetterExchange}),
    ...(deadLetterRoutingKey && {deadLetterRoutingKey}),
    ...(expires && {expires}),

  }
}

export const CRITICAL_QUEUE_OPTIONS:Pick<QueueOptions, "queueMode"| "maxPriority" | "maxLength"> = {
  queueMode: "lazy", maxPriority: "critical", maxLength: 10000, 
}

export const CACHE_INVALIDATION_QUEUE_OPTIONS:QueueOptions = {
  maxLength:500, // old invalidations aren’t critical once superseded
  maxPriority: "low"
}