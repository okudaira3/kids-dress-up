import { useMemo, useState } from "react";

type StepKey = "person" | "top" | "bottom" | "accessory";

type Option = {
  id: string;
  label: string;
  emoji?: string;
  cardImage: string;
  previewImage?: string;
};

type Step = {
  key: StepKey;
  title: string;
  shortTitle: string;
  guide: string;
  options: Option[];
};

type Selected = {
  person: string | null;
  top: string | null;
  bottom: string | null;
  accessory: string | null;
};

const initialSelected: Selected = {
  person: null,
  top: null,
  bottom: null,
  accessory: null,
};

const steps: Step[] = [
  {
    key: "person",
    title: "ひとをえらぶ",
    shortTitle: "ひと",
    guide: "まずは きせるひとを えらぼう",
    options: [
      {
        id: "girl",
        label: "おんなのこ",
        emoji: "🎀",
        cardImage: "/assets/cards/person-girl.png",
      },
      {
        id: "boy",
        label: "おとこのこ",
        emoji: "⭐",
        cardImage: "/assets/cards/person-boy.png",
      },
    ],
  },
  {
    key: "top",
    title: "うえのふく",
    shortTitle: "うえ",
    guide: "つぎは うえのふくを えらぼう",
    options: [
      {
        id: "tshirt",
        label: "Tシャツ",
        cardImage: "/assets/cards/top-tshirt.png",
        previewImage: "/assets/preview/top-tshirt.png",
      },
      {
        id: "shirt",
        label: "シャツ",
        cardImage: "/assets/cards/top-shirt.png",
        previewImage: "/assets/preview/top-shirt.png",
      },
      {
        id: "blouse",
        label: "ブラウス",
        cardImage: "/assets/cards/top-blouse.png",
        previewImage: "/assets/preview/top-blouse.png",
      },
      {
        id: "trainer",
        label: "トレーナー",
        cardImage: "/assets/cards/top-trainer.png",
        previewImage: "/assets/preview/top-trainer.png",
      },
    ],
  },
  {
    key: "bottom",
    title: "したのふく",
    shortTitle: "した",
    guide: "こんどは したのふくを えらぼう",
    options: [
      {
        id: "pants",
        label: "ズボン",
        cardImage: "/assets/cards/bottom-pants.png",
        previewImage: "/assets/preview/bottom-pants.png",
      },
      {
        id: "jeans",
        label: "ジーンズ",
        cardImage: "/assets/cards/bottom-jeans.png",
        previewImage: "/assets/preview/bottom-jeans.png",
      },
      {
        id: "shorts",
        label: "はんズボン",
        cardImage: "/assets/cards/bottom-shorts.png",
        previewImage: "/assets/preview/bottom-shorts.png",
      },
      {
        id: "skirt",
        label: "スカート",
        cardImage: "/assets/cards/bottom-skirt.png",
        previewImage: "/assets/preview/bottom-skirt.png",
      },
    ],
  },
  {
    key: "accessory",
    title: "みにつけるもの",
    shortTitle: "こもの",
    guide: "さいごに こものを えらぼう",
    options: [
      {
        id: "backpack",
        label: "リュック",
        cardImage: "/assets/cards/accessory-backpack.png",
        previewImage: "/assets/preview/accessory-backpack.png",
      },
      {
        id: "glasses",
        label: "めがね",
        cardImage: "/assets/cards/accessory-glasses.png",
        previewImage: "/assets/preview/accessory-glasses.png",
      },
      {
        id: "hat",
        label: "ぼうし",
        cardImage: "/assets/cards/accessory-hat.png",
        previewImage: "/assets/preview/accessory-hat.png",
      },
    ],
  },
];

const getCurrentStepIndex = (selected: Selected): number => {
  if (!selected.person) return 0;
  if (!selected.top) return 1;
  if (!selected.bottom) return 2;
  if (!selected.accessory) return 3;
  return 4;
};

const isStepEnabled = (stepIndex: number, selected: Selected): boolean => {
  const currentStepIndex = getCurrentStepIndex(selected);
  return stepIndex <= currentStepIndex;
};

const getStepValue = (selected: Selected, stepKey: StepKey): string | null => {
  return selected[stepKey];
};

const getOption = (stepKey: StepKey, optionId: string | null): Option | undefined => {
  if (!optionId) return undefined;
  return steps.find((step) => step.key === stepKey)?.options.find((option) => option.id === optionId);
};

function AvatarPreview({ selected }: { selected: Selected }) {
  const selectedPerson = selected.person ?? "girl";
  const selectedTop = getOption("top", selected.top);
  const selectedBottom = getOption("bottom", selected.bottom);
  const selectedAccessory = getOption("accessory", selected.accessory);

  return (
    <section className="previewCard" aria-label="キャラクタープレビュー">
      <div className="previewHeader">
        <p className="eyebrow">ぷれびゅー</p>
        <h2>おきがえ かんせいちゅう</h2>
      </div>

      <div className={`avatarStage person-${selectedPerson}`}>
        <div className="avatarGlow" />
        <div className={`avatarCharacter person-${selectedPerson}`}>
          <div className="hair" />
          <div className="head">
            <div className="eye left" />
            <div className="eye right" />
            <div className="mouth" />
          </div>
          <div className="torso" />
          <div className="arm left" />
          <div className="arm right" />
          <div className="leg left" />
          <div className="leg right" />
        </div>

        {selectedTop?.previewImage ? (
          <img className="avatarLayer top" src={selectedTop.previewImage} alt="" aria-hidden="true" />
        ) : null}
        {selectedBottom?.previewImage ? (
          <img className="avatarLayer bottom" src={selectedBottom.previewImage} alt="" aria-hidden="true" />
        ) : null}
        {selectedAccessory?.previewImage ? (
          <img className="avatarLayer accessory" src={selectedAccessory.previewImage} alt="" aria-hidden="true" />
        ) : null}
      </div>

      <div className="selectionSummary" aria-live="polite">
        <p>
          ひと: <strong>{getOption("person", selected.person)?.label ?? "まだ"}</strong>
        </p>
        <p>
          うえ: <strong>{selectedTop?.label ?? "まだ"}</strong>
        </p>
        <p>
          した: <strong>{selectedBottom?.label ?? "まだ"}</strong>
        </p>
        <p>
          こもの: <strong>{selectedAccessory?.label ?? "まだ"}</strong>
        </p>
      </div>
    </section>
  );
}

type StepSectionProps = {
  step: Step;
  stepIndex: number;
  enabled: boolean;
  active: boolean;
  selectedValue: string | null;
  onSelect: (stepKey: StepKey, optionId: string) => void;
};

function StepSection({
  step,
  stepIndex,
  enabled,
  active,
  selectedValue,
  onSelect,
}: StepSectionProps) {
  return (
    <section
      className={[
        "stepSection",
        enabled ? "is-enabled" : "is-disabled",
        active ? "is-active" : "",
        selectedValue ? "is-complete" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={`step-title-${step.key}`}
    >
      <div className="stepHeader">
        <div>
          <p className="stepBadge">{stepIndex + 1}</p>
          <h3 id={`step-title-${step.key}`}>{step.title}</h3>
        </div>
        {!enabled ? <p className="lockedText">まだあとでね</p> : null}
      </div>

      <div className="optionGrid">
        {step.options.map((option) => {
          const isSelected = selectedValue === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={["optionCard", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
              onClick={() => onSelect(step.key, option.id)}
              disabled={!enabled}
              aria-pressed={isSelected}
            >
              <span className="optionEmoji" aria-hidden="true">
                {option.emoji ?? " "}
              </span>
              <img src={option.cardImage} alt="" className="optionImage" />
              <span className="optionLabel">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Selected>(initialSelected);

  const currentStepIndex = getCurrentStepIndex(selected);
  const isComplete = Boolean(selected.person && selected.top && selected.bottom && selected.accessory);

  const currentGuide = useMemo(() => {
    if (isComplete) {
      return "できた！ すてきな ふくが えらべたね";
    }

    return steps[currentStepIndex]?.guide ?? "すきな ふくを えらぼう";
  }, [currentStepIndex, isComplete]);

  const handleSelect = (stepKey: StepKey, optionId: string) => {
    setSelected((previous) => ({
      ...previous,
      [stepKey]: optionId,
    }));
  };

  const reset = () => {
    setSelected(initialSelected);
  };

  return (
    <main className="appShell">
      <div className="pageDecoration pageDecoration-left" />
      <div className="pageDecoration pageDecoration-right" />

      <section className="heroPanel">
        <p className="eyebrow">きっず どれすあっぷ</p>
        <h1>おきがえ あそび</h1>
        <p className="guideMessage" aria-live="polite">
          {currentGuide}
        </p>
      </section>

      <div className="contentLayout">
        <AvatarPreview selected={selected} />

        <section className="stepsPanel" aria-label="おきがえのせんたく">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">せんたく</p>
              <h2>じゅんばんに えらぼう</h2>
            </div>
            <button type="button" className="resetButton" onClick={reset}>
              やりなおす
            </button>
          </div>

          {steps.map((step, stepIndex) => {
            const enabled = isStepEnabled(stepIndex, selected);
            const active = enabled && stepIndex === currentStepIndex;
            return (
              <StepSection
                key={step.key}
                step={step}
                stepIndex={stepIndex}
                enabled={enabled}
                active={active}
                selectedValue={getStepValue(selected, step.key)}
                onSelect={handleSelect}
              />
            );
          })}

          {isComplete ? <p className="completeBanner">できた！</p> : null}
        </section>
      </div>
    </main>
  );
}
