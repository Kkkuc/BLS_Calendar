import React from 'react';
import type { MatchDto } from '../../types/match';
import styles from './MatchList.module.css';

interface MatchColumnProps {
    title: string;
    matches: MatchDto[];
    selectedMatches?: MatchDto[];
    onToggleMatch?: (match: MatchDto) => void;
    onToggleAll?: () => void;
    isSelectable?: boolean;
    formatDate: (date: string | Date | undefined) => string;
    isMatchSelected?: (match: MatchDto) => boolean;
}

export const MatchColumn: React.FC<MatchColumnProps> = ({
                                                            title,
                                                            matches,
                                                            selectedMatches = [],
                                                            onToggleMatch,
                                                            onToggleAll,
                                                            isSelectable = false,
                                                            formatDate,
                                                            isMatchSelected
                                                        }) => {
    const allSelected = isSelectable && selectedMatches.length === matches.length && matches.length > 0;

    return (
        <div className={styles.matchesColumn}>
            <div className={styles.columnHeader}>
                {isSelectable ? (
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onToggleAll}
                            className={styles.accentCheckbox}
                        />
                        <span className={styles.columnTitle}>{title}</span>
                    </label>
                ) : (
                    <span className={styles.columnTitle}>{title}</span>
                )}
                <span className={styles.countBadge}>({matches.length})</span>
            </div>

            <div className={styles.scrollableMatchesList}>
                {matches.length === 0 ? (
                    <p className={styles.emptyText}>Brak meczów w tej sekcji.</p>
                ) : (
                    matches.map((match, idx) => {
                        const selected = isSelectable && isMatchSelected ? isMatchSelected(match) : false;

                        return (
                            <div
                                key={idx}
                                onClick={() => isSelectable && onToggleMatch && onToggleMatch(match)}
                                className={`${styles.matchCardItem} ${selected ? styles.selected : ''} ${!isSelectable ? styles.unclickable : ''}`}
                            >
                                <div className={styles.matchCardTop}>
                                    {isSelectable ? (
                                        <div className={styles.matchCheckboxGroup}>
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleMatch && onToggleMatch(match)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={styles.accentCheckbox}
                                            />
                                            <span className={styles.roundBadge}>Kolejka {match.round}</span>
                                        </div>
                                    ) : (
                                        <span className={styles.roundBadge}>Kolejka {match.round}</span>
                                    )}
                                    <span className={styles.matchDate}>{formatDate(match.matchDate)}</span>
                                </div>

                                {isSelectable ? (
                                    <>
                                        <div className={styles.matchTeams}>
                                            {match.host} – {match.guest}
                                        </div>
                                        <div className={styles.matchCourt}>
                                            📍 {match.court || 'Sektor nieznany'}
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.matchTeamsScore}>
                                        <span className="truncate pr-2">{match.host} vs {match.guest}</span>
                                        <span className={styles.scoreTag}>
                                            {match.hostSetsResult} : {match.guestSetsResult}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};