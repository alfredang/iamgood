"use client";

import { HealthTag, HEALTH_TAG_LABELS, HEALTH_TAG_COLORS } from "@/lib/types";

interface HealthTagsProps {
  onSelect: (tag: HealthTag) => void;
}

const TAGS: HealthTag[] = ["okay", "unwell", "need-talk"];

export default function HealthTags({ onSelect }: HealthTagsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`${HEALTH_TAG_COLORS[tag]} border px-5 py-3 rounded-full text-base font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer`}
        >
          {HEALTH_TAG_LABELS[tag]}
        </button>
      ))}
    </div>
  );
}
