export interface Team {
    id: number;
    name: string;
    league?: number; // Jeśli C# zwraca numer ligi
    url: string;
}