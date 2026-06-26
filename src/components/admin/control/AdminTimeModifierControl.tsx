import { memo, useMemo, useState } from 'react';
import styles from '../../../pages/Admin/AdminPanel.module.css';
import type { DurationUnit, TimeModifierControlProps } from '../adminPanelTypes.ts';
import { formatDate } from '../adminPanelUtils.ts';

const DURATION_UNITS: DurationUnit[] = ['minutes', 'hours', 'days'];

export const AdminTimeModifierControl = memo(({
    currentValue,
    intent,
    initialAmount,
    initialUnit,
    label,
    submitLabel,
    onSubmit,
}: TimeModifierControlProps) => {
    const [amount, setAmount] = useState(initialAmount);
    const [unit, setUnit] = useState<DurationUnit>(initialUnit);
    const formattedCurrentValue = useMemo(() => formatDate(currentValue), [currentValue]);
    const buttonClassName = intent === 'danger' ? styles.actionBtnDanger : styles.actionBtnWarning;

    return (
        <div className={styles.controlCard}>
            <div className={styles.inlineHeader}>
                <span className={styles.subTitle}>{label}</span>
                <span className={styles.sectionNote}>Current: {formattedCurrentValue}</span>
            </div>
            <div className={styles.durationRow}>
                <input
                    className={styles.numberInput}
                    inputMode="numeric"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                />
                <select
                    className={styles.selectInput}
                    value={unit}
                    onChange={(event) => setUnit(event.target.value as DurationUnit)}
                >
                    {DURATION_UNITS.map((durationUnit) => (
                        <option key={durationUnit} value={durationUnit}>
                            {durationUnit}
                        </option>
                    ))}
                </select>
                <button
                    className={buttonClassName}
                    type="button"
                    onClick={() => onSubmit(Number(amount), unit)}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
});
