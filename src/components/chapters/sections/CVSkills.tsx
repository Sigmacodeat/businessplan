"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useMessages } from "next-intl";
import { z } from "zod";

// TypeScript Interfaces
interface SkillCategory {
  name: string;
  items: string[];
}

interface LanguageItem {
  name: string;
  level: string;
}

interface CVSkillsProps {
  skills?: SkillCategory[];
  languages?: LanguageItem[];
  hideInnerTitles?: boolean;
}

// Zod Schemas for validation
const SkillCategorySchema = z.object({
  name: z.string().min(1),
  items: z.array(z.string().min(1)),
});

const LanguageItemSchema = z.object({
  name: z.string().min(1),
  level: z.string().min(1),
});

const SkillCategoriesSchema = z.array(SkillCategorySchema);
const LanguagesSchema = z.array(LanguageItemSchema);

export default function CVSkills({ skills, languages, hideInnerTitles }: CVSkillsProps) {
  const t = useTranslations("cv");
  const messages = useMessages();

  // Get skills from i18n if not provided via props
  const skillsFromI18n = React.useMemo(() => {
    const root = messages as Record<string, unknown> | undefined;
    if (!root || typeof root !== "object") return undefined;
    const cvRaw = "cv" in root ? (root["cv"] as unknown) : undefined;
    if (!cvRaw || typeof cvRaw !== "object") return undefined;
    const cvObj = cvRaw as Record<string, unknown>;
    const skillsRaw = "skills" in cvObj ? (cvObj["skills"] as unknown) : undefined;
    if (!skillsRaw || typeof skillsRaw !== "object") return undefined;
    const skillsObj = skillsRaw as Record<string, unknown>;
    return "categories" in skillsObj ? (skillsObj["categories"] as unknown) : undefined;
  }, [messages]);

  // Get languages from i18n if not provided via props
  const languagesFromI18n = React.useMemo(() => {
    const root = messages as Record<string, unknown> | undefined;
    if (!root || typeof root !== "object") return undefined;
    const cvRaw = "cv" in root ? (root["cv"] as unknown) : undefined;
    if (!cvRaw || typeof cvRaw !== "object") return undefined;
    const cvObj = cvRaw as Record<string, unknown>;
    return "languages" in cvObj ? (cvObj["languages"] as unknown) : undefined;
  }, [messages]);

  // Validate and use skills data
  const validatedSkills = React.useMemo(() => {
    if (skills && SkillCategoriesSchema.safeParse(skills).success) {
      return skills;
    }
    if (skillsFromI18n && SkillCategoriesSchema.safeParse(skillsFromI18n).success) {
      return skillsFromI18n as SkillCategory[];
    }
    return [];
  }, [skills, skillsFromI18n]);

  // Validate and use languages data
  const validatedLanguages = React.useMemo(() => {
    if (languages && LanguagesSchema.safeParse(languages).success) {
      return languages;
    }
    if (languagesFromI18n && LanguagesSchema.safeParse(languagesFromI18n).success) {
      const langObj = languagesFromI18n as Record<string, unknown>;
      return "items" in langObj ? (langObj["items"] as LanguageItem[]) : [];
    }
    return [];
  }, [languages, languagesFromI18n]);

  const hasContent = validatedSkills.length > 0 || validatedLanguages.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Skills Section */}
      {validatedSkills.length > 0 && (
        <section className="space-y-8">
          {!hideInnerTitles && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl font-semibold tracking-tight text-[--color-foreground-strong]"
            >
              {t("skills.title", { default: "Kenntnisse & Fähigkeiten" })}
            </motion.h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {validatedSkills.map((category, categoryIndex) => (
              <motion.div
                key={`${category.name}-${categoryIndex}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="group"
              >
                <div className="relative h-full bg-[--color-surface] rounded-[14px] p-5 md:p-6 shadow-none transition-shadow duration-300">
                  <h3 className="text-lg md:text-xl font-semibold text-[--color-foreground-strong] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[--color-primary] to-[--color-primary-dark] opacity-80 group-hover:opacity-100 transition-opacity" />
                    {category.name}
                  </h3>
                  <ul className="space-y-2.5">
                    {category.items.map((item, itemIndex) => (
                      <motion.li
                        key={`${item}-${itemIndex}`}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                        className="flex items-start gap-2.5"
                      >
                        <span className="mt-2 w-[6px] h-[6px] rounded-full bg-emerald-400/60 ring-1 ring-emerald-300/40 shadow-[0_0_0_2px_rgba(0,0,0,0.04)] flex-shrink-0" />
                        <span className="text-[--color-foreground] text-[13px] md:text-[14px] leading-relaxed">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  {/* Overlays entfernt, um jeden weißen Rand/Glanz zu vermeiden */}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Languages Section */}
      {validatedLanguages.length > 0 && (
        <section className="space-y-8">
          {!hideInnerTitles && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl md:text-3xl font-semibold tracking-tight text-[--color-foreground-strong]"
            >
              {t("languages.title", { default: "Sprachen" })}
            </motion.h2>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedLanguages.map((language, index) => (
              <motion.div
                key={`${language.name}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                className="group"
              >
                <div className="relative h-full bg-[--color-surface] rounded-[12px] p-4 shadow-none transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[--color-foreground-strong] text-base md:text-lg">
                      {language.name}
                    </span>
                    <span className="text-sm text-[--color-foreground-muted] bg-[--color-surface]/60 px-2.5 py-1 rounded-full">
                      {language.level}
                    </span>
                  </div>
                  {/* Visual proficiency indicator */}
                  <div className="mt-3 h-1.5 bg-[--color-border-subtle]/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: language.level === 'Muttersprache' || language.level === 'Native' ? '100%' : '85%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 + (index * 0.1) }}
                      className="h-full bg-gradient-to-r from-[--color-primary] to-[--color-primary-dark] rounded-full"
                    />
                  </div>
                  {/* Overlays entfernt, um jeden weißen Rand/Glanz zu vermeiden */}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
