import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [roll, setRoll] = useState(localStorage.getItem("roll") || '');
  const [pass, setPass] = useState(localStorage.getItem("pass") || '');
  const [bool, setBool] = useState(true);
  const [showDiv, setShowDiv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
 const x = {
  "attendance_summary": [
    {
      "attendance_today": "PPPP",
      "subject": "CRT"
    },
    {
      "attendance_today": "AAPP",
      "subject": "MEFA"
    },
    {
      "attendance_today": "PP",
      "subject": "ML"
    }
  ]
};
const AttendanceDisplay = ({ data }) => {
    // Check if data is valid and contains attendance entries
    const summary = data?.attendance_summary;
    const hasAttendance = summary && !summary[0]?.message;
  
    return (
      <div className="attendance-container" style={{ paddingTop: '6px' }}>
        {hasAttendance ? (
          summary.map((item, index) => (
            <div className="subject-row" key={index} style={{ padding: '6px' }}>
              <div className="subject-attendance-container" style={{ display: 'flex' }}>
                <div
                  className="subject-name"
                  style={{
                    paddingRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {item.subject}
                </div>
  
                <div className="attendance-boxes" style={{ display: 'flex' }}>
                  {item.attendance_today.split('').map((char, i) => {
                    const backgroundColor =
                      char === 'P' ? '#7953D2' :
                      char === 'A' ? '#cccccc' :
                      '#f9fafb';
  
                    const textColor =
                      char === 'P' ? '#FFFFFF' :
                      char === 'A' ? '#000000' :
                      '#374151';
  
                    return (
                      <div
                        key={i}
                        style={{
                          backgroundColor,
                          color: textColor,
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          padding: '6px',
                          marginRight: '8px',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '12px', fontStyle: 'italic', color: '#6b7280' }}>
            {summary?.[0]?.message || 'No attendance data available.'}
          </div>
        )}
      </div>
    );
  };
  
  
  const styles = {
    // Inline styles
    inline: {
      '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
      },
      buttonContainer: {
        display: 'inline-block',
      },
      imageButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
      },
      buttonIcon: {
        width: '140px',
        height: '140px',
        transition: 'transform 0.3s',
      },
      spin: {
        animation: 'spin 2s linear infinite',
      },
    },
  
  };
  
  useEffect(() => {
    const storedData = localStorage.getItem("attendanceData");
    if (storedData) {
      setData(JSON.parse(storedData));
      setBool(false);
    }
  }, []);

  const handleSubmit = () => {
    if (!roll || !pass) {
      alert('Please provide both Roll Number and Password.');
      return;
    }

    setLoading(true);
    console.log("AA");

    fetch(`/api/attendance?student_id=${roll}&password=${pass}`)
      .then(res => res.json())
      .then(json => {
        const attendanceData = json.attendance || json;
        setData(attendanceData);
        localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
        setBool(false);
      })
      .catch(err => {
        console.error("Fetch failed:", err);
        setData("Failed to fetch data");
      })
      .finally(() => 
      {
        setLoading(false)
        console.log("BB");
      }
    );
  };

  const handleButtonClick = () => setShowDiv(true);
  const handleCloseClick = () => setShowDiv(false);

  return (
    <div className="container">
  {bool ? (
    <>
      <div className="form-group">
        <label htmlFor="roll">Roll Number</label>
        <input
          type="text"
          id="roll"
          value={roll}
          onChange={(e) => {
            setRoll(e.target.value);
            localStorage.setItem("roll", e.target.value);
          }}
          placeholder="Enter Roll Number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="pass">Password</label>
        <input
          type="password"
          id="pass"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            localStorage.setItem("pass", e.target.value);
          }}
          placeholder="Enter Password"
        />
      </div>

      <button onClick={handleSubmit}>{loading ? 'Loading...' : 'Submit'}</button>
    </>
  ) : null}

  {data && (
    <>
        
      <button
  className="image-button btn"
  onClick={handleSubmit}
  style={styles.imageButton}
>
  <img
    src="data:image/jpeg;base64,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"
    alt="Reload"
    style={{
      ...styles.buttonIcon,
      ...(loading ? styles.spin : {})
    }}
    className="button-icon"
  />
</button>

      <div className="attendance-summary">
        {typeof data === 'string' ? (
          <p>{data}</p>
        ) : (
          <>
            <p className="at">
              {data.total_info?.total_percentage || 'N/A'}%
              {' '}({data.total_info?.total_held || 'N/A'} / {data.total_info?.total_attended || 'N/A'})
            </p>
          </>
        )}

        <button onClick={() => setBool(true)}>Change</button>
        <button onClick={handleButtonClick}>View below 75%</button>

        {showDiv && (
          <div className="subject-list">
            {data.subjectwise_summary?.map((e, idx) =>
              parseFloat(e.percentage) < 75 ? (
                <div key={idx} className="subject-item">
                  <span>{e.subject_name}</span>
                  <span className="attendance-badge warning">{e.percentage}%</span>
                </div>
              ) : null
            )}
            <button className="close-btn" onClick={handleCloseClick}>Close</button>
          </div>
        )}
      </div>

    </>
  )}
  <div>
  {data ? <AttendanceDisplay data={data} /> : <></>}
</div>

</div>

  );
}

export default App;
