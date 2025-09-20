import { motion } from 'framer-motion';
import ElegantCard from '@/components/ui/ElegantCard';
import CountUp from '@/components/charts/CountUp';
import { useTranslations } from 'next-intl';
import { z } from 'zod'; 
import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ui/error-message'; 
import { Skeleton } from '@/components/ui/skeleton'; 
import { defaultTransition } from '@/components/animation/variants';

const KPIItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  value: z.number(),
  description: z.string().optional(),
});

type KPIItem = z.infer<typeof KPIItemSchema>;

interface KPISectionProps {
  data: unknown; 
  layout?: 'grid' | 'list';
  title?: string;
  description?: string;
}

export function KPISection({ data, layout = 'grid', title, description }: KPISectionProps) {
  const t = useTranslations('KPISection');
  const [validatedData, setValidatedData] = useState<KPIItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const result = KPIItemSchema.array().parse(data);
      setValidatedData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Invalid data format'));
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className={layout === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
        : 'space-y-4'
      }>
        {[1, 2, 3].map((id) => (
          <ElegantCard
            key={id}
            className="h-full"
            innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
            role="group"
            ariaLabel="KPI Skeleton Card"
          >
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </ElegantCard>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={t('dataError')} />;
  }

  if (validatedData.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">{t('noData')}</p>;
  }

  return (
    <section className="py-8">
      {title && <h2 className="mb-4">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      
      <div className={layout === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
        : 'space-y-4'
      }>
        {validatedData.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition }}
          >
            <ElegantCard
              ariaLabel={`${t(item.title, { default: item.title })}: ${item.value}`}
              role="group"
              className="h-full"
              innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
            >
              <div className="text-center">
                <div className="text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted] one-line">
                  {t(item.title, { default: item.title })}
                </div>
                <div className="font-semibold text-[--color-foreground-strong] [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums] text-[17px] md:text-[18px] leading-tight">
                  <CountUp
                    to={item.value}
                    durationMs={2500}
                  />
                </div>
                <div className="mx-auto mt-2 h-px w-8/12 bg-[--color-border-subtle]/25" aria-hidden />
                {item.description && (
                  <div className="mt-1.5 text-[12px] md:text-[12.5px] text-[--color-foreground] opacity-85 one-line">
                    {t(item.description, { default: item.description })}
                  </div>
                )}
              </div>
            </ElegantCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
