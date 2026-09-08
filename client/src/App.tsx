import {useState, useEffect} from 'react';
import type {Team} from './types';
import type {MatchDto} from './types/match';
import TeamSelection from './components/TeamSelection/TeamSelection.tsx';
import {MatchList} from './components/MatchList/MatchList.tsx';
import {ExportConfirmModal, type ExportSummaryData} from './components/ExportConfirmModal';
import {ExportSummaryModal} from './components/ExportSummaryModal';
import './App.css';

export default function App() {
    // Inicjalizacja wybranej drużyny z sessionStorage
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(() => {
        const savedTeam = sessionStorage.getItem('selectedTeam');
        return savedTeam ? JSON.parse(savedTeam) : null;
    });

    const [matchesToExport, setMatchesToExport] = useState<MatchDto[]>([]);
    const [exportStep, setExportStep] = useState<'closed' | 'confirm' | 'summary'>('closed');
    const [summaryData, setSummaryData] = useState<ExportSummaryData | null>(null);

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    });

    // Zapisywanie wybranej drużyny do sessionStorage przy każdej zmianie
    const handleSelectTeam = (team: Team | null) => {
        setSelectedTeam(team);
        if (team) {
            sessionStorage.setItem('selectedTeam', JSON.stringify(team));
        } else {
            sessionStorage.removeItem('selectedTeam');
        }
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (exportStep !== 'closed') {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [theme, exportStep]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleOpenExportModal = (matches: MatchDto[]) => {
        setMatchesToExport(matches);
        setExportStep('confirm');
    };

    const handleExportSuccess = (data: ExportSummaryData) => {
        setSummaryData(data);
        setExportStep('summary');
    };

    const handleResetAll = () => {
        setExportStep('closed');
        setSummaryData(null);
        setMatchesToExport([]);
        handleSelectTeam(null);
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        {selectedTeam ? (
                            <button
                                onClick={() => handleSelectTeam(null)}
                                className="tab-button active back-navbar-btn"
                            >
                                ← Wybór drużyny
                            </button>
                        ) : (
                            <span className="navbar-title">Wybór drużyny</span>
                        )}

                        <a
                            href="https://blssiatkowka.ligspace.pl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-link secondary-link"
                        >
                            <span className="text-xs">Ligspace BLS ↗</span>
                        </a>
                    </div>

                    <div className="navbar-actions">
                        <label className="theme-switch" title="Zmień motyw">
                            <input
                                type="checkbox"
                                onChange={toggleTheme}
                                checked={theme === 'light'}
                            />
                            <span className="slider">
                                <span className="icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                            </span>
                        </label>
                    </div>
                </div>
            </nav>

            <div className="main-content">
                <header className="header">
                    <img
                        src="/front_logo_BLS.jpg"
                        alt="Białostocka Liga Sportu"
                        className="bls-logo"
                    />
                </header>

                <main>
                    {!selectedTeam ? (
                        <TeamSelection onSelectTeam={handleSelectTeam}/>
                    ) : (
                        <MatchList
                            team={selectedTeam}
                            onBack={() => handleSelectTeam(null)}
                            onExportSelected={handleOpenExportModal}
                        />
                    )}
                </main>

                <ExportConfirmModal
                    isOpen={exportStep === 'confirm'}
                    matches={matchesToExport}
                    onClose={() => setExportStep('closed')}
                    onSuccess={handleExportSuccess}
                />

                <ExportSummaryModal
                    isOpen={exportStep === 'summary'}
                    summary={summaryData}
                    onClose={() => setExportStep('closed')}
                    onRetry={() => setExportStep('confirm')}
                    onResetTeamSelection={handleResetAll}
                />
            </div>
        </div>
    );
}