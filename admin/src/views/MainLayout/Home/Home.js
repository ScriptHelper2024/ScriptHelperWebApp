import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaSync, FaTimes } from 'react-icons/fa'; // Using FaTimes for a more compact clear button
import useApi from '../../../api/useApi';
import usePageTitle from '../../../hooks/usePageTitle';
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu';

const Home = () => {
    usePageTitle('Home');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const api = useApi();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStatistics();
    }, [startDate, endDate]);

    const fetchStatistics = () => {
        setLoading(true);
        api.platformStatistics({
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
        })
        .then(response => {
            setStats(response);
            setLoading(false);
        })
        .catch(err => {
            setError(err.message || 'An error occurred');
            setLoading(false);
        });
    };

    return (
        <div className="Home page bg-gray-100 p-4">
            <PageContextMenu title="Home" />
						<div className="admin-dashboard bg-gray-100 p-4">
		            <div className="welcome-section mb-4">
		                <h1 className="text-2xl font-bold">Welcome to the Admin Dashboard</h1>
		                <div className="quick-links mt-4">
		                    <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
		                    <div className="links grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
		                        <div className="general-links">
		                            <h3 className="text-lg font-medium">General:</h3>
		                            <ul>
		                                <li><a href="https://sh-webapp.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">Frontend Web App</a></li>
		                                <li><a href="http://signoz.ironcladtech.ca:3301/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">OpenTelemetry (SigNoz)</a></li>
		                            </ul>
		                        </div>
		                        <div className="developer-links">
		                            <h3 className="text-lg font-medium">Developer:</h3>
		                            <ul>
		                                <li><a href="/" target="_blank" rel="noopener noreferrer"  className="text-blue-500 hover:text-blue-600">API Docs</a></li>
		                                <li><a href="/predefinedQueries.json" rel="noopener noreferrer"  target="_blank" className="text-blue-500 hover:text-blue-600">predefinedQueries.json</a></li>
		                                <li><a href="/functionsByModule.txt" rel="noopener noreferrer"  target="_blank" className="text-blue-500 hover:text-blue-600">functionsByModule.txt</a></li>
		                                <li><a href="http://18.217.185.231:15672" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">RabbitMQ Server</a></li>
		                            </ul>
		                        </div>
		                    </div>
		                </div>
		            </div>
							</div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <h2 className="text-2xl font-bold">Platform Statistics</h2>
                <div className="flex flex-wrap gap-4 mt-4 lg:mt-0 items-end">
                    <div className="relative flex items-center">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mr-2">Start Date:</label>
                        <DatePicker
                            id="startDate"
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            isClearable={true}
                            className="form-input mt-1"
                        />
                    </div>
                    <div className="relative flex items-center">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mr-2">End Date:</label>
                        <DatePicker
                            id="endDate"
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            isClearable={true}
                            className="form-input mt-1"
                        />
                    </div>
                    <button
                        onClick={fetchStatistics}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-150 ease-in-out self-end lg:self-center">
                        <FaSync />
                    </button>
                </div>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>Error loading statistics: {error}</p>}
            <div className="stats-cards grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                    key !== '__typename' && (
                        <div key={key} className="stat-card bg-white p-4 shadow rounded-lg flex flex-col items-center">
                            <h3 className="text-lg font-semibold w-full text-center break-words">{key.replace(/_/g, ' ').toUpperCase()}</h3>
                            <p className="text-xl w-full text-center break-words">{value}</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default Home;
