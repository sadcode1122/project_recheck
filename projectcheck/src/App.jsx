import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [domains, setDomains] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const fetchDomains = () => {
    fetch('http://localhost:5000/api/domains')
      .then(res => res.json())
      .then(data => setDomains(data))
      .catch(err => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleScan = async () => {
    if (window.confirm("คุณต้องการเริ่มสแกนตรวจสอบ URL ปลายทางของทุกโดเมนใช่หรือไม่?")) {
      setIsScanning(true);
      try {
        const response = await fetch('http://localhost:5000/api/scan-urls');
        const result = await response.json();
        alert(result.message);
        fetchDomains(); 
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการสแกน");
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1 style={{ color: '#646cff', textAlign: 'center' }}>Domain Check Dashboard</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={handleScan} 
          disabled={isScanning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isScanning ? '#ccc' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isScanning ? 'not-allowed' : 'pointer'
          }}
        >
          {isScanning ? '⏳ กำลังตรวจสอบโดเมน... (โปรดรอสักครู่)' : '🔍 Scan Real URLs'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', color: '#000' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <th style={tableHeaderStyle}>Domain</th>
              <th style={tableHeaderStyle}>Sub</th>
              <th style={tableHeaderStyle}>URL</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Pard</th>
              <th style={tableHeaderStyle}>url parddomain</th>
              <th style={tableHeaderStyle}>status_parddomain</th>
              <th style={tableHeaderStyle}>Pard หลังจากตรวจสอบ</th>
              <th style={tableHeaderStyle}>ซับโดเมนหลัก</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tableCellStyle}><strong>{item.domain}</strong></td>
                <td style={tableCellStyle}>{item.sup_domain}</td>
                <td style={tableCellStyle}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#646cff' }}>
                      {item.url}
                    </a>
                  ) : '-'}
                </td>
                <td style={tableCellStyle}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: item.status_domain === 200 ? '#2e7d32' : '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {item.status_domain || 'N/A'}
                  </span>
                </td>
                <td style={tableCellStyle}>{item.parddomain || '-'}</td>
                <td style={tableCellStyle}>{item.url_parddomain || '-'}</td>
                <td style={tableCellStyle}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: item.status_parddomain === 200 ? '#2e7d32' : '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {item.status_parddomain || 'N/A'}
                  </span>
                </td>
                                <td style={tableCellStyle}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: item.pard_after === item.pard ? '#2e7d32' : '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {item.pard_after || 'N/A'}
                  </span>
                </td>
                {/* ตัวอย่างการเพิ่มคอลัมน์ในตาราง */}
                <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#f0f0f0', // สีพื้นหลังอ่อนๆ
                        fontWeight: 'bold'
                    }}>
                        {item.subdomain_after || '-'}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const tableHeaderStyle = { padding: '12px', textAlign: 'left' };
const tableCellStyle = { padding: '12px' };

export default App