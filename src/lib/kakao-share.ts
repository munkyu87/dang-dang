type KakaoSdk = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (settings: Record<string, unknown>) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

function loadSdk(key: string) {
  if (window.Kakao) {
    if (!window.Kakao.isInitialized()) window.Kakao.init(key);
    return Promise.resolve(window.Kakao);
  }
  return new Promise<KakaoSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => {
      if (!window.Kakao) {
        reject(new Error("카카오톡 공유를 불러오지 못했습니다."));
        return;
      }
      window.Kakao.init(key);
      resolve(window.Kakao);
    };
    script.onerror = () => reject(new Error("카카오톡 공유를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

export async function shareToKakao(key: string, content: { title: string; description: string; url: string; imageUrl: string }) {
  const kakao = await loadSdk(key);
  kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: content.title,
      description: content.description,
      imageUrl: content.imageUrl,
      link: { mobileWebUrl: content.url, webUrl: content.url },
    },
    buttons: [{ title: "열어 보기", link: { mobileWebUrl: content.url, webUrl: content.url } }],
  });
}
