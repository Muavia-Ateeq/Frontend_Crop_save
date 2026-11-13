import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar, CloudRain } from 'lucide-react';
import { cropSaveApi } from '../cropSaveApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(month) {
  const [year, monthNumber] = String(month || '').split('-');
  const index = Number(monthNumber) - 1;
  return year && index >= 0 && index < MONTH_NAMES.length
    ? `${MONTH_NAMES[index]} '${year.slice(-2)}`
    : String(month || '');
}

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return error?.message || 'Unable to retrieve rainfall history.';
}

export default function Charts({ district }) {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const districtName = district?.name || '';
  const targetLat = district?.lat;
  const targetLon = district?.lon;

  useEffect(() => {
    const controller = new AbortController();
    const params = {};
    if (districtName) params.district = districtName;
    if (targetLat !== undefined && targetLat !== null) params.lat = targetLat;
    if (targetLon !== undefined && targetLon !== null) params.lon = targetLon;

    cropSaveApi.get('/history', { params, signal: controller.signal })
      .then(({ data }) => {
        if (!Array.isArray(data?.months)) {
          throw new Error('The CropSave API returned an invalid rainfall history.');
        }
        setMonths(data.months.slice(-12));
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setMonths([]);
          setErrorMessage(`Could not load rainfall history: ${getErrorMessage(error)}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [districtName, targetLat, targetLon]);

  const totalRain = useMemo(
    () => months.reduce((total, month) => total + Number(month.rain_mm || 0), 0),
    [months],
  );
  const averageRain = months.length ? (totalRain / months.length).toFixed(1) : '0.0';
  const peakMonth = months.reduce(
    (peak, month) => (Number(month.rain_mm || 0) > Number(peak?.rain_mm || 0) ? month : peak),
    null,
  );

  const chartData = useMemo(() => ({
    labels: months.map((month) => formatMonth(month.month)),
    datasets: [{
      label: 'Rainfall (mm)',
      data: months.map((month) => Number(month.rain_mm || 0)),
      borderColor: '#3B6D11',
      borderWidth: 2,
      backgroundColor: 'rgba(99,153,34,0.12)',
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#639922',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      fill: true,
      tension: 0.35,
    }],
  }), [months]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1A1A1A',
        bodyColor: '#0F6E56',
        borderColor: '#E5E5E3',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: '#888780', font: { family: 'Inter, sans-serif', size: 11 }, maxTicksLimit: 6 },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: 'rgba(26,26,26,0.07)' },
        ticks: {
          color: '#888780',
          font: { family: 'Inter, sans-serif', size: 11 },
          callback: (value) => `${value} mm`,
        },
      },
    },
  }), []);

  return (
    <section className="crop-save-history glass-emerald" style={{ margin: '0 0 24px', padding: '24px' }}>
      <div className="crop-save-history-heading">
        <div>
          <div className="crop-save-history-kicker">
            <CloudRain size={16} aria-hidden="true" />
            <span>NASA POWER · rainfall history</span>
          </div>
          <h3>12-month rainfall history</h3>
          <p>Monthly precipitation for <strong>{districtName}</strong></p>
        </div>
        <span className="crop-save-history-period">
          <Calendar size={14} aria-hidden="true" />
          Last 12 months
        </span>
      </div>

      <div className="crop-save-rain-metrics">
        <div><span>Total rainfall</span><strong>{totalRain.toFixed(1)} mm</strong></div>
        <div><span>Peak month</span><strong>{peakMonth ? formatMonth(peakMonth.month) : '--'}</strong></div>
        <div><span>Monthly average</span><strong>{averageRain} mm</strong></div>
      </div>

      <div className="crop-save-chart">
        {loading ? (
          <p role="status">Loading rainfall history…</p>
        ) : errorMessage ? (
          <p className="crop-save-chart-message" role="status">{errorMessage}</p>
        ) : months.length ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p className="crop-save-chart-message">No rainfall history is available for this district.</p>
        )}
      </div>
      <p className="crop-save-chart-footnote">
        Historical values are supplied by the CropSave API. Check the source data before using them for farm decisions.
      </p>
    </section>
  );
}
