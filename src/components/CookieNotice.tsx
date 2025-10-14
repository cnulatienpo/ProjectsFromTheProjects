import { useEffect, useState } from "react";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-3 text-xs flex justify-between items-center">
      <span>This site uses cookies to improve experience.</span>
      <button
        onClick={() => {
          localStorage.setItem("cookieConsent", "v1");
          setVisible(false);
        }}
        className="bg-white text-black px-2 py-1 font-bold"
      >
        Accept
      </button>
    </div>
  );
}
