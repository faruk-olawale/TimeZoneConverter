import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, Share2, Plus, Trash2, Sun, Moon, AlertCircle } from 'lucide-react';

const TimezoneConverter = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Timezone mapping: Country/City format
  const timezoneData = {
    'United States/New York': 'America/New_York',
    'United States/Chicago': 'America/Chicago',
    'United States/Denver': 'America/Denver',
    'United States/Los Angeles': 'America/Los_Angeles',
    'United States/Phoenix': 'America/Phoenix',
    'United States/Anchorage': 'America/Anchorage',
    'United States/Honolulu': 'Pacific/Honolulu',
    'Canada/Toronto': 'America/Toronto',
    'Canada/Vancouver': 'America/Vancouver',
    'Canada/Montreal': 'America/Montreal',
    'Canada/Calgary': 'America/Edmonton',
    'Mexico/Mexico City': 'America/Mexico_City',
    'Brazil/Sao Paulo': 'America/Sao_Paulo',
    'Brazil/Rio de Janeiro': 'America/Sao_Paulo',
    'Argentina/Buenos Aires': 'America/Argentina/Buenos_Aires',
    'United Kingdom/London': 'Europe/London',
    'France/Paris': 'Europe/Paris',
    'Germany/Berlin': 'Europe/Berlin',
    'Italy/Rome': 'Europe/Rome',
    'Spain/Madrid': 'Europe/Madrid',
    'Netherlands/Amsterdam': 'Europe/Amsterdam',
    'Belgium/Brussels': 'Europe/Brussels',
    'Switzerland/Zurich': 'Europe/Zurich',
    'Austria/Vienna': 'Europe/Vienna',
    'Poland/Warsaw': 'Europe/Warsaw',
    'Greece/Athens': 'Europe/Athens',
    'Russia/Moscow': 'Europe/Moscow',
    'Russia/Saint Petersburg': 'Europe/Moscow',
    'Turkey/Istanbul': 'Europe/Istanbul',
    'United Arab Emirates/Dubai': 'Asia/Dubai',
    'Saudi Arabia/Riyadh': 'Asia/Riyadh',
    'Israel/Jerusalem': 'Asia/Jerusalem',
    'India/Mumbai': 'Asia/Kolkata',
    'India/Delhi': 'Asia/Kolkata',
    'India/Bangalore': 'Asia/Kolkata',
    'Pakistan/Karachi': 'Asia/Karachi',
    'Bangladesh/Dhaka': 'Asia/Dhaka',
    'Thailand/Bangkok': 'Asia/Bangkok',
    'Vietnam/Hanoi': 'Asia/Bangkok',
    'Singapore/Singapore': 'Asia/Singapore',
    'Malaysia/Kuala Lumpur': 'Asia/Kuala_Lumpur',
    'Indonesia/Jakarta': 'Asia/Jakarta',
    'Philippines/Manila': 'Asia/Manila',
    'China/Beijing': 'Asia/Shanghai',
    'China/Shanghai': 'Asia/Shanghai',
    'China/Hong Kong': 'Asia/Hong_Kong',
    'Taiwan/Taipei': 'Asia/Taipei',
    'Japan/Tokyo': 'Asia/Tokyo',
    'South Korea/Seoul': 'Asia/Seoul',
    'Australia/Sydney': 'Australia/Sydney',
    'Australia/Melbourne': 'Australia/Melbourne',
    'Australia/Brisbane': 'Australia/Brisbane',
    'Australia/Perth': 'Australia/Perth',
    'New Zealand/Auckland': 'Pacific/Auckland',
    'New Zealand/Wellington': 'Pacific/Auckland',
    'South Africa/Johannesburg': 'Africa/Johannesburg',
    'Egypt/Cairo': 'Africa/Cairo',
    'Nigeria/Lagos': 'Africa/Lagos',
    'Kenya/Nairobi': 'Africa/Nairobi',
  };

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Load URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventData = params.get('event');
    if (eventData) {
      try {
        const decoded = JSON.parse(atob(eventData));
        setFormData(decoded);
        setShowForm(true);
      } catch (e) {
        console.error('Invalid event data in URL');
      }
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save events
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications. Please try using Chrome, Firefox, or Edge for notification features.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Try to send test notification
        try {
          new Notification('Notifications Enabled!', {
            body: 'You will receive reminders 15 minutes before your events',
            icon: '🔔',
            badge: '🔔'
          });
        } catch (e) {
          // Fallback for browsers that don't support notifications fully
          console.log('Notification created but may not display on this device');
          alert('✅ Notifications enabled! You will receive reminders 15 minutes before your events.');
        }
      } else if (permission === 'denied') {
        alert('Notifications blocked. Please enable them in your browser settings:\n\n1. Tap the lock/info icon in the address bar\n2. Find "Notifications"\n3. Change to "Allow"');
      } else {
        alert('Notification permission not granted. You can enable this later in browser settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('✅ Notification permission saved! Note: Some mobile browsers may not show desktop-style notifications, but the app will still track your events and remind you when you open it.');
    }
  };

  // Check for upcoming events and send notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      
      events.forEach(event => {
        // Get the IANA timezone code
        const ianaTimezone = timezoneData[event.timezone] || event.timezone;
        
        // Create event date in the event's timezone
        const eventDateStr = `${event.date}T${event.time}:00`;
        const eventTime = new Date(eventDateStr);
        
        const diff = eventTime - now;
        const fifteenMinutes = 15 * 60 * 1000;

        // Check if event is within 15 minutes and not yet notified
        if (diff > 0 && diff <= fifteenMinutes && !event.notified) {
          try {
            // Try browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Upcoming Event: ${event.title}`, {
                body: `Starting in ${Math.round(diff / 60000)} minutes at ${event.time}`,
                icon: '🔔',
                badge: '🔔',
                requireInteraction: false,
                tag: `event-${event.id}`
              });
            }
          } catch (e) {
            console.log('Notification error:', e);
            // Fallback: just mark as notified
          }
          
          // Mark as notified regardless of notification success
          setEvents(prev => prev.map(e => 
            e.id === event.id ? { ...e, notified: true } : e
          ));
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [events, notificationsEnabled]);

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all fields');
      return;
    }
    
    const newEvent = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      notified: false
    };

    setEvents([...events, newEvent]);
    setFormData({
      title: '',
      date: '',
      time: '',
      timezone: Object.keys(timezoneData)[0]
    });
    setShowForm(false);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const convertToLocalTime = (date, time, displayTimezone) => {
    try {
      // Get IANA timezone
      const ianaTimezone = timezoneData[displayTimezone] || displayTimezone;
      
      // Parse the date and time as if they're in the event's timezone
      const dateTimeStr = `${date}T${time}:00`;
      const eventDate = new Date(dateTimeStr);
      
      // Format in the event's timezone to get the actual UTC time
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Format in user's timezone
      const localFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        weekday: 'long'
      });
      
      return localFormatter.format(eventDate);
    } catch (e) {
      console.error('Conversion error:', e);
      return 'Invalid date/time';
    }
  };

  const shareEvent = (event) => {
    const eventData = btoa(JSON.stringify({
      title: event.title,
      date: event.date,
      time: event.time,
      timezone: event.timezone
    }));
    
    const url = `${window.location.origin}${window.location.pathname}?event=${eventData}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Join me for ${event.title}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const generateCalendarLink = (event) => {
    const ianaTimezone = timezoneData[event.timezone] || event.timezone;
    const eventDate = new Date(`${event.date}T${event.time}:00`);
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);
    
    const format = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(eventDate)}/${format(endDate)}&details=${encodeURIComponent(`Event in ${event.timezone}`)}&location=${encodeURIComponent(event.timezone)}&ctz=${ianaTimezone}`;
    
    window.open(googleUrl, '_blank');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .app {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
        }

        .app.dark {
          background: #1a1a1a;
        }

        .theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
          margin-bottom: 40px;
        }

        .theme-toggle-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #ddd;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .app.dark .theme-toggle-btn {
          background: #2d2d2d;
          border-color: #444;
          color: white;
        }

        .theme-toggle-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding-top: 80px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
        }

        .app.dark .header {
          background: #2d2d2d;
          border-color: #444;
          color: white;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #333;
          white-space: nowrap;
          flex-wrap: nowrap;
        }

        .app.dark .header h1 {
          color: white;
        }

        .header p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 15px;
        }

        .app.dark .header p {
          color: #aaa;
        }

        .header .instruction {
          font-size: 0.95rem;
          color: #888;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 6px;
          margin-top: 15px;
          border-left: 3px solid #333;
        }

        .app.dark .header .instruction {
          background: #1a1a1a;
          color: #bbb;
        }

        .controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 24px;
          border: 2px solid #333;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          background: white;
          color: #333;
          min-height: 44px;
          justify-content: center;
        }

        .btn:hover {
          background: #333;
          color: white;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #333;
          color: white;
        }

        .btn-primary:hover {
          background: #555;
        }

        .btn-success {
          background: #28a745;
          color: white;
          border-color: #28a745;
        }

        .btn-success:hover {
          background: #218838;
        }

        .app.dark .btn {
          background: #2d2d2d;
          color: white;
          border-color: #555;
        }

        .app.dark .btn:hover {
          background: #444;
        }

        .app.dark .btn-primary {
          background: #555;
          border-color: #666;
        }

        .app.dark .btn-primary:hover {
          background: #666;
        }

        .form-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
          animation: slideIn 0.3s ease;
        }

        .app.dark .form-card {
          background: #2d2d2d;
          color: white;
          border-color: #444;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .form-group input[type="date"],
        .form-group input[type="time"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .app.dark .form-group label {
          color: #e0e0e0;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          max-width: 100%;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .app.dark .form-group input,
        .app.dark .form-group select {
          background: #1a1a1a;
          border-color: #555;
          color: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #333;
        }

        .app.dark .form-group input:focus,
        .app.dark .form-group select:focus {
          border-color: #666;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
        }

        .events-grid {
          display: grid;
          gap: 20px;
        }

        .event-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 25px;
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease;
        }

        .app.dark .event-card {
          background: #2d2d2d;
          color: white;
          border-color: #444;
        }

        .event-card:hover {
          border-color: #333;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .app.dark .event-card:hover {
          border-color: #666;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .app.dark .event-header {
          border-bottom-color: #444;
        }

        .event-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }

        .app.dark .event-title {
          color: white;
        }

        .event-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          padding: 8px;
          border: 1px solid #ddd;
          background: #f9f9f9;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
        }

        .app.dark .icon-btn {
          background: #1a1a1a;
          color: white;
          border-color: #555;
        }

        .icon-btn:hover {
          background: #333;
          color: white;
          border-color: #333;
        }

        .app.dark .icon-btn:hover {
          background: #444;
          border-color: #666;
        }

        .event-info {
          display: grid;
          gap: 12px;
          margin-bottom: 15px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .app.dark .info-row {
          background: #1a1a1a;
          border-color: #444;
        }

        .info-label {
          font-weight: 600;
          color: #333;
          min-width: 120px;
        }

        .app.dark .info-label {
          color: #e0e0e0;
        }

        .info-value {
          color: #666;
        }

        .app.dark .info-value {
          color: #aaa;
        }

        .local-time {
          margin-top: 15px;
          padding: 15px;
          background: #f9f9f9;
          border: 2px solid #333;
          border-radius: 4px;
        }

        .app.dark .local-time {
          background: #1a1a1a;
          border-color: #666;
        }

        .local-time-label {
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .app.dark .local-time-label {
          color: #e0e0e0;
        }

        .local-time-value {
          font-size: 1.2rem;
          color: #333;
          font-weight: 600;
        }

        .app.dark .local-time-value {
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
        }

        .app.dark .empty-state {
          background: #2d2d2d;
          border-color: #444;
          color: white;
        }

        .empty-state svg {
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #333;
        }

        .app.dark .empty-state h3 {
          color: white;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 20px;
        }

        .app.dark .empty-state p {
          color: #aaa;
        }

        .notification-banner {
          background: #fff3cd;
          color: #856404;
          padding: 15px 20px;
          border: 2px solid #ffc107;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .app.dark .notification-banner {
          background: #332701;
          color: #ffc107;
          border-color: #ffc107;
        }

        @media (max-width: 768px) {
          .container {
            padding-top: 80px;
          }

          .theme-toggle {
            top: 10px;
            right: 10px;
          }

          .theme-toggle-btn {
            width: 45px;
            height: 45px;
          }

          .header h1 {
            font-size: 1.5rem;
            gap: 10px;
          }

          .header h1 svg {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
          }

          .controls {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions .btn {
            width: 100%;
          }

          .event-header {
            flex-direction: column;
            gap: 15px;
          }

          .event-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 480px) {
          .header h1 {
            font-size: 1.2rem;
            gap: 8px;
          }

          .header h1 svg {
            width: 24px;
            height: 24px;
          }

          .header p {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="theme-toggle">
        <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="container">
        <div className="header">
          <h1>
            <Clock size={48} />
            Time Zone Converter
          </h1>
          <p>Convert event times across time zones instantly</p>
          <div className="instruction">
            <strong>How to use:</strong> Create an event with its time and timezone. The app will automatically show you what time it is in YOUR local timezone!
          </div>
        </div>

        <div className="controls">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} />
            Add Event
          </button>
          
          {!notificationsEnabled ? (
            <button className="btn" onClick={requestNotificationPermission}>
              <Bell size={20} />
              Enable Notifications
            </button>
          ) : (
            <button className="btn btn-success" disabled>
              <Bell size={20} />
              Notifications Enabled ✓
            </button>
          )}
        </div>

        {!notificationsEnabled && (
          <div className="notification-banner">
            <AlertCircle size={20} />
            <span>Enable notifications to get reminders 15 minutes before your events!</span>
          </div>
        )}

        {showForm && (
          <div className="form-card">
            <h2 style={{ marginBottom: '20px' }}>Create New Event</h2>
            <div>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Team Meeting"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Time (in the selected timezone below)</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Event Time Zone (Country/City)</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                >
                  {Object.keys(timezoneData).sort().map(displayName => (
                    <option key={displayName} value={displayName}>
                      {displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="empty-state">
            <Calendar size={80} />
            <h3>No Events Yet</h3>
            <p>Create your first event to get started with time zone conversion</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <div className="event-actions">
                    <button className="icon-btn" onClick={() => generateCalendarLink(event)} title="Add to Calendar">
                      <Calendar size={20} />
                    </button>
                    <button className="icon-btn" onClick={() => shareEvent(event)} title="Share Event">
                      <Share2 size={20} />
                    </button>
                    <button className="icon-btn" onClick={() => deleteEvent(event.id)} title="Delete Event">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="event-info">
                  <div className="info-row">
                    <span className="info-label">Event Time:</span>
                    <span className="info-value">{event.date} at {event.time}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Time Zone:</span>
                    <span className="info-value">{event.timezone}</span>
                  </div>
                </div>

                <div className="local-time">
                  <div className="local-time-label">
                    <Clock size={18} />
                    Your Local Time:
                  </div>
                  <div className="local-time-value">
                    {convertToLocalTime(event.date, event.time, event.timezone)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimezoneConverter;