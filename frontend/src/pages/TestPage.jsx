import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Project Test Navigation</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Use this page to easily navigate to the different screens in the project during development.
      </p>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        maxWidth: '400px'
      }}>
        <Link 
          to="/login" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Login Page
        </Link>
        <Link 
          to="/doctors/home" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Home
        </Link>
        <Link 
          to="/doctors/dashboard" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Dashboard
        </Link>
        <Link 
          to="/doctors/tickets" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Tickets
        </Link>
        <Link 
          to="/doctors/tickets/1" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Ticket Details
        </Link>
        <Link 
          to="/doctors/service-order/1" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Service Order
        </Link>
        <Link 
          to="/doctors/record-result/1" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Record Result
        </Link>
        <Link 
          to="/doctors/medicine-selector" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Medicine Selector
        </Link>
        <Link 
          to="/doctors/notifications" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Doctor Notifications
        </Link>
        
        <h2 style={{ color: '#333', marginTop: '16px', borderTop: '1px solid #d1d5db', paddingTop: '16px' }}>Receptionist Pages</h2>
        <Link 
          to="/receptionists/today-orders" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Receptionist Today Orders
        </Link>
        <Link 
          to="/receptionists/new-reception" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Receptionist New Reception
        </Link>
        <Link 
          to="/receptionists/clinical-queue" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Receptionist Clinical Queue
        </Link>

        <h2 style={{ color: '#333', marginTop: '16px', borderTop: '1px solid #d1d5db', paddingTop: '16px' }}>Staff Pages</h2>
        <Link 
          to="/staffs/receptions" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Staff Reception List
        </Link>
        <Link 
          to="/staffs/notifications" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Staff Notifications
        </Link>
        <Link 
          to="/staffs/payment" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Staff Payment
        </Link>
        <Link 
          to="/staffs/receipt-list" 
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Staff Receipt List
        </Link>

        <h2 style={{ color: '#333', marginTop: '16px', borderTop: '1px solid #d1d5db', paddingTop: '16px' }}>Tech Staff Pages</h2>
        <Link
          to="/techs/home"
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Tech Staff Home
        </Link>
        <Link
          to="/techs/record-result/1"
          style={{ padding: '10px 15px', backgroundColor: '#f0f4f8', borderRadius: '8px', textDecoration: 'none', color: '#1e40af', fontWeight: '500', border: '1px solid #d1d5db' }}
        >
          Tech Staff Record Result
        </Link>
      </div>
    </div>
  );
};

export default TestPage;
