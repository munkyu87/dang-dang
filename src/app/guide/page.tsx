export default function GuidePage() {
  const steps = [
    ["사건을 만듭니다", "함께 재판은 상대를 초대하고, 혼자 재판은 바로 적습니다. 체험은 가상 사건입니다."],
    ["각자 진술합니다", "함께 재판에서는 상대 원문이 보이지 않습니다. 제출하면 고칠 수 없습니다."],
    ["판결을 봅니다", "책임 비율, 판단 보류, 쌍방 책임 없음이 나올 수 있습니다. 위험하면 판결 대신 안내가 나옵니다."],
    ["동의한 뒤에만 공유합니다", "링크와 이미지는 필요한 동의가 끝난 뒤에 만들어집니다."],
  ];
  return (
    <article className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <h1 className="text-4xl font-black">이용방법</h1>
      <p className="text-lg font-bold">로그인 없이 링크만으로 진행하는 재미용 재판입니다. 법적 효력은 없습니다.</p>
      {steps.map(([title, body], index) => (
        <section key={title} className="press bg-white p-5">
          <p className="text-sm font-black text-hero">0{index + 1}</p>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-2 leading-relaxed">{body}</p>
        </section>
      ))}
    </article>
  );
}
