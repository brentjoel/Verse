import { getAllEmotions, getEmotionById } from "@/lib/emotions";
import { socialImage } from "@/lib/social-image";

export const alt = "A feeling on Selah Sky, in its own light.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllEmotions().map((emotion) => ({ emotion: emotion.id }));
}

export default async function Image({ params }: { params: Promise<{ emotion: string }> }) {
  const emotion = getEmotionById((await params).emotion);
  return socialImage(emotion);
}
