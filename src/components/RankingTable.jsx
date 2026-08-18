import { Swords } from 'lucide-react';
import SelectField from './SelectField';

export default function RankingTable({
  ranking,
  rankingFilter,
  setRankingFilter,
  days,
  showKillsCount = false,
}) {
  return (
    <section className="panel-card">
      <div className="panel-card__header panel-card__header--between">
        <div className="panel-card__title-wrap">
          <div className="panel-card__icon">
            <Swords size={18} />
          </div>
          <div className="panel-card__title">Ranking</div>
        </div>

        <div className="panel-card__filter">
          <SelectField value={rankingFilter} onChange={(event) => setRankingFilter(event.target.value)}>
            <option value="all">Total</option>
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="table-shell">
        <div className="table-scroll">
          <table className={`ranking-table${showKillsCount ? ' ranking-table--with-kills' : ''}`}>
            <thead>
              <tr>
                <th>#</th>
                <th>Slot</th>
                {showKillsCount && <th>Kill</th>}
                <th>{showKillsCount ? 'Pts. Kill' : 'Kill'}</th>
                <th>Posic.</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((team, index) => {
                const isTopThree = index < 3;

                return (
                  <tr key={`${team.id}-${team.rank}`} className={isTopThree ? 'ranking-table__row--top' : ''}>
                    <td data-label="Puesto">
                      <span className={`rank-chip ${isTopThree ? 'rank-chip--top' : ''}`}>{team.rank}</span>
                    </td>

                    <td data-label="Slot" className="ranking-table__slot">
                      {team.name}
                    </td>

                    {showKillsCount && <td data-label="Kill">{team.killsTotal}</td>}

                    <td data-label={showKillsCount ? 'Pts. Kill' : 'Kill'}>{team.killsPointsTotal}</td>

                    <td data-label="Posic.">{team.positionPointsTotal}</td>

                    <td data-label="Total" className="ranking-table__strong">
                      {team.totalPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
