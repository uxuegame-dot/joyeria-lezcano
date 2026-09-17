"use client";

import {
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

type RevealProps = {
    children: ReactNode;
    className?: string;
    soft?: boolean;
    delay?: number;
};

type RevealDirection =
    | "up"
    | "down";

export function Reveal({
    children,
    className = "",
    soft = false,
    delay = 0,
}: RevealProps) {
    const [visible, setVisible] =
        useState(false);

    const [direction, setDirection] =
        useState<RevealDirection>("down");

    const elementRef =
        useRef<HTMLDivElement | null>(null);

    const previousScrollY =
        useRef(0);

    useEffect(() => {
        const element =
            elementRef.current;

        if (!element) {
            return;
        }

        const motionQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        if (motionQuery.matches) {
            setVisible(true);
            return;
        }

        previousScrollY.current =
            window.scrollY;

        let frameId: number | null = null;

        function checkVisibility() {
            const currentElement =
                elementRef.current;

            if (!currentElement) {
                return;
            }

            const currentScrollY =
                window.scrollY;

            const scrollingDown =
                currentScrollY >
                previousScrollY.current;

            const scrollingUp =
                currentScrollY <
                previousScrollY.current;

            if (scrollingDown) {
                setDirection("down");
            }

            if (scrollingUp) {
                setDirection("up");
            }

            previousScrollY.current =
                currentScrollY;

            const rect =
                currentElement.getBoundingClientRect();

            const viewportHeight =
                window.innerHeight;

            let shouldBeVisible = false;

            /*
             * BAJANDO
             *
             * La sección aparece cuando su parte
             * superior entra aproximadamente al
             * 86% de la pantalla.
             */
            if (
                direction === "down" ||
                scrollingDown
            ) {
                shouldBeVisible =
                    rect.top <
                    viewportHeight *
                    0.86 &&
                    rect.bottom > 0;
            }

            /*
             * SUBIENDO
             *
             * La sección aparece cuando su parte
             * inferior vuelve a entrar por arriba.
             */
            if (scrollingUp) {
                shouldBeVisible =
                    rect.bottom >
                    viewportHeight *
                    0.14 &&
                    rect.top <
                    viewportHeight;
            }

            /*
             * Si ya está completamente fuera de
             * pantalla, la dejamos preparada para
             * animarse nuevamente.
             */
            const completelyAbove =
                rect.bottom <= 0;

            const completelyBelow =
                rect.top >= viewportHeight;

            if (
                completelyAbove ||
                completelyBelow
            ) {
                shouldBeVisible = false;
            }

            setVisible(
                shouldBeVisible
            );
        }

        function requestCheck() {
            if (frameId !== null) {
                return;
            }

            frameId =
                window.requestAnimationFrame(
                    () => {
                        checkVisibility();

                        frameId = null;
                    }
                );
        }

        checkVisibility();

        window.addEventListener(
            "scroll",
            requestCheck,
            {
                passive: true,
            }
        );

        window.addEventListener(
            "resize",
            requestCheck
        );

        function handleMotionChange(
            event: MediaQueryListEvent
        ) {
            if (event.matches) {
                setVisible(true);
            } else {
                checkVisibility();
            }
        }

        motionQuery.addEventListener(
            "change",
            handleMotionChange
        );

        return () => {
            window.removeEventListener(
                "scroll",
                requestCheck
            );

            window.removeEventListener(
                "resize",
                requestCheck
            );

            motionQuery.removeEventListener(
                "change",
                handleMotionChange
            );

            if (frameId !== null) {
                window.cancelAnimationFrame(
                    frameId
                );
            }
        };
    }, [direction]);

    return (
        <div
            ref={elementRef}
            className={`
                ${soft
                    ? "reveal-soft"
                    : "reveal"
                }

                ${direction === "up"
                    ? "reveal-from-top"
                    : "reveal-from-bottom"
                }

                ${visible
                    ? "reveal-visible"
                    : ""
                }

                ${className}
            `}
            style={{
                transitionDelay:
                    visible && delay > 0
                        ? `${delay}ms`
                        : "0ms",
            }}
        >
            {children}
        </div>
    );
}