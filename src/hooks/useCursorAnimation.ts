import { useEffect } from "react"

export function useCursorAnimation() {
    useEffect(() => {
        const bg = document.getElementById("cursor-bg")
        let animationFrame: number
        let timeoutId: ReturnType<typeof setTimeout>

        const pos = { x: 0, y: 0 };
        let target = { x: 0, y: 0 };

        const updatePosition = () => {
            pos.x += (target.x - pos.x) * 0.1;
            pos.y += (target.y - pos.y) * 0.1;

            if (bg) {
                bg.style.background = `radial-gradient(300px at ${pos.x}px ${pos.y}px, rgba(98, 75, 250, 0.15), transparent 80%)`
                bg.style.opacity = "1"
            }

            animationFrame = requestAnimationFrame(updatePosition)
        }

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const x = "touches" in e ? e.touches[0].clientX : e.clientX
            const y = "touches" in e ? e.touches[0].clientY : e.clientY
            target = {x, y}

            if (!animationFrame) animationFrame = requestAnimationFrame(updatePosition)

            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                if (bg) bg.style.opacity = "0"
                cancelAnimationFrame(animationFrame)
                animationFrame = 0
            }, 1200)
        }

        window.addEventListener("mousemove", handleMove)
        window.addEventListener("touchmove", handleMove)

        return () => {
            window.removeEventListener("mousemove", handleMove)
            window.removeEventListener("touchmove", handleMove)
            cancelAnimationFrame(animationFrame)
        }
    }, [])
}
