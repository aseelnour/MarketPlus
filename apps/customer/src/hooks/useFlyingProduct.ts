
import { useRef, useCallback } from "react";

interface FlyingProductOptions {
  productImage: string;
  productTitle: string;
}

export const useFlyingProduct = () => {
  const flyingElementRef = useRef<HTMLDivElement | null>(null);

  const flyProduct = useCallback(
    (
      productElement: HTMLElement,
      cartIconElement: HTMLElement,
      options: FlyingProductOptions,
    ) => {
      if (!productElement || !cartIconElement) return;

      const productRect = productElement.getBoundingClientRect();
      const cartRect = cartIconElement.getBoundingClientRect();

      const flyingEl = document.createElement("div");
      flyingEl.style.position = "fixed";
      flyingEl.style.width = "60px";
      flyingEl.style.height = "60px";
      flyingEl.style.borderRadius = "16px";
      flyingEl.style.overflow = "hidden";
      flyingEl.style.zIndex = "99999";
      flyingEl.style.pointerEvents = "none";
      flyingEl.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
      flyingEl.style.transition = "all 2s cubic-bezier(0.34, 1.56, 0.64, 1)";

      flyingEl.innerHTML = `
        <img src="${options.productImage}" alt="${options.productTitle}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />
        <div style="position:absolute;inset:0;border-radius:16px;border:2px solid rgba(255,255,255,0.3);"></div>
      `;

      const startX = productRect.left + productRect.width / 2 - 30;
      const startY = productRect.top + productRect.height / 2 - 30;
      flyingEl.style.left = `${startX}px`;
      flyingEl.style.top = `${startY}px`;
      flyingEl.style.transform = "scale(0.5) rotate(-10deg)";
      flyingEl.style.opacity = "1";

      document.body.appendChild(flyingEl);
      flyingElementRef.current = flyingEl;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const endX = cartRect.left + cartRect.width / 2 - 30;
          const endY = cartRect.top + cartRect.height / 2 - 30;

          flyingEl.style.left = `${endX}px`;
          flyingEl.style.top = `${endY}px`;
          flyingEl.style.transform = "scale(0.2) rotate(0deg)";
          flyingEl.style.opacity = "1";
          flyingEl.style.width = "30px";
          flyingEl.style.height = "30px";
        });
      });

      return new Promise<void>((resolve) => {
        const onFinish = () => {
          if (flyingEl.parentNode) {
            flyingEl.remove();
          }
          flyingElementRef.current = null;
          resolve();
        };

        flyingEl.addEventListener("transitionend", () => {
          onFinish();
        });

        setTimeout(() => {
          if (flyingEl.parentNode) {
            onFinish();
          }
        }, 1500);
      });
    },
    [],
  );

  return { flyProduct };
};
