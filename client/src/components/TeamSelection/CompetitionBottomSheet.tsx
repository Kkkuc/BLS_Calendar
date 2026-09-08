import styles from './TeamSelection.module.css';

export type CompetitionType = 'league1' | 'league2' | 'cup' | 'cupElim' | 'superCup';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentCompetition: CompetitionType;
    onSelect: (type: CompetitionType) => void;
    getCompetitionName: (type: CompetitionType) => string;
    getCompetitionEmoji: (type: CompetitionType) => string;
}

const COMPETITIONS: CompetitionType[] = ['league1', 'league2', 'cup', 'cupElim', 'superCup'];

export function CompetitionBottomSheet({
                                           isOpen,
                                           onClose,
                                           currentCompetition,
                                           onSelect,
                                           getCompetitionName,
                                           getCompetitionEmoji
                                       }: Props) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheetContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.sheetHeader}>
                    <h3 className={styles.sheetTitle}>Wybierz rozgrywki</h3>
                    <button onClick={onClose} className={styles.closeBtn}>✕</button>
                </div>
                <div className={styles.competitionList}>
                    {COMPETITIONS.map((type) => {
                        const active = currentCompetition === type;
                        return (
                            <div
                                key={type}
                                onClick={() => onSelect(type)}
                                className={`${styles.competitionOption} ${active ? styles.active : ''}`}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>{getCompetitionEmoji(type)}</span>
                                    <span>{getCompetitionName(type)}</span>
                                </div>
                                {active && <span>✓</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}