'use client';
import { useEffect, useRef } from "react";
import { Globe } from "lucide-react";

const GoogleTranslate = () => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const addScript = document.createElement("script");
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        addScript.async = true;
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "es,hi,fr,de,zh-CN,ar,ta,bn,ru,ja,ko",
                    layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                    autoDisplay: false,
                },
                "google_translate_element"
            );

            // Style dropdown after initialization
            setTimeout(styleDropdown, 100);
        };

        // Watch for dropdown dynamic creation and style it
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    styleDropdown();
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            const script = document.querySelector('script[src*="translate.google.com"]');
            if (script) {
                script.remove();
            }
            observer.disconnect();
        };
    }, []);

    const styleDropdown = () => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
            select.style.border = "1px solid var(--border-color)";
            select.style.borderRadius = "8px";
            select.style.padding = "8px 12px";
            select.style.fontFamily = "inherit";
            select.style.fontSize = "14px";
            select.style.width = "200px";
            select.style.cursor = "pointer";
            select.style.backgroundColor = "var(--background-color)";
            select.style.color = "var(--text-color)";
        }
    };

    const handleGlobeClick = () => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
            select.click();
            select.focus();
        }
    };

    return (
        <div className="google-translate-wrapper" ref={dropdownRef}>
            <Globe
                size={20}
                className="translate-icon"
                onClick={handleGlobeClick}
            />
            <div id="google_translate_element" />
        </div>
    );
};

export default GoogleTranslate;