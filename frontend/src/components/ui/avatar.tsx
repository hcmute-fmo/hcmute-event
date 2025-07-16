import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                "size-8 sm:size-10 md:size-12",
                className
            )}
            {...props}
        />
    )
}

function AvatarImage({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn("aspect-square size-full object-cover", className)}
            {...props}
        />
    )
}

function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                "bg-muted flex size-full items-center justify-center rounded-full",
                "text-xs sm:text-sm md:text-base font-medium text-muted-foreground",
                className
            )}
            {...props}
        />
    )
}

export { Avatar, AvatarImage, AvatarFallback }
