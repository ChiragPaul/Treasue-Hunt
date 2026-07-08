import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const generateTeamNumber = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TH-${randomNum}`;
};

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [numPlayers, setNumPlayers] = useState(3);
  const [teamName, setTeamName] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTeamNumber(generateTeamNumber());
  }, []);

  // Update members array when numPlayers changes
  useEffect(() => {
    const newMembers = [...members];
    while (newMembers.length < numPlayers) {
      newMembers.push({
        registerNumber: '',
        name: '',
        yearOfGraduation: '',
        course: '',
        specialization: '',
        contactNumber: '',
        email: ''
      });
    }
    // Trim if numPlayers decreased
    if (newMembers.length > numPlayers) {
      newMembers.length = numPlayers;
    }
    setMembers(newMembers);
  }, [numPlayers]);

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\+?[\d\s-]{10,15}$/.test(phone);
  };

  const nextStep = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (step === 1) {
        if (!teamName.trim()) {
          setError('Team name is required');
          setIsSubmitting(false);
          return;
        }
        
        // Validate team name with backend
        const res = await fetch(import.meta.env.VITE_API_URL + '/validate-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamName })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.msg);
          setIsSubmitting(false);
          return;
        }
      } else if (step > 1 && step <= numPlayers + 1) {
        const memberIndex = step - 2;
        const member = members[memberIndex];
        
        if (!member.registerNumber || !member.name || !member.email || !member.contactNumber) {
          setError('All fields are required.');
          setIsSubmitting(false);
          return;
        }

        if (!validateEmail(member.email)) {
          setError('Please enter a valid email address.');
          setIsSubmitting(false);
          return;
        }

        if (!validatePhone(member.contactNumber)) {
          setError('Please enter a valid contact number (10-15 digits).');
          setIsSubmitting(false);
          return;
        }

        // Validate duplicates within the form
        for (let i = 0; i < memberIndex; i++) {
          if (members[i].registerNumber.toLowerCase() === member.registerNumber.toLowerCase()) {
            setError(`Register number already used by Operative 0${i + 1}`);
            setIsSubmitting(false);
            return;
          }
          if (members[i].email.toLowerCase() === member.email.toLowerCase()) {
            setError(`Email already used by Operative 0${i + 1}`);
            setIsSubmitting(false);
            return;
          }
          if (members[i].contactNumber === member.contactNumber) {
            setError(`Contact number already used by Operative 0${i + 1}`);
            setIsSubmitting(false);
            return;
          }
        }

        // Validate member details with backend
        const res = await fetch(import.meta.env.VITE_API_URL + '/validate-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.msg);
          setIsSubmitting(false);
          return;
        }
      }
      
      setStep(step + 1);
    } catch (err) {
      console.error(err);
      setError('Network error during validation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamName,
          teamNumber,
          members
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Transmission sent. Registration successful! Team Number: ' + data.team.teamNumber);
        navigate('/');
      } else {
        setError(data.msg || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Unable to reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMemberForm = (index) => {
    const member = members[index];
    if (!member) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease' }}>
        <h3 style={{ color: 'rgba(57, 255, 20, 0.9)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
          OPERATIVE 0{index + 1} DETAILS
        </h3>
        
        <div className="input-group">
          <label>&gt; REGISTER NUMBER_</label>
          <input 
            type="text" 
            required
            value={member.registerNumber}
            onChange={(e) => handleMemberChange(index, 'registerNumber', e.target.value)}
            placeholder="e.g. RA2000000000000"
          />
        </div>

        <div className="input-group">
          <label>&gt; FULL NAME_</label>
          <input 
            type="text" 
            required
            value={member.name}
            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>&gt; YEAR OF GRADUATION_</label>
          <input 
            type="number" 
            required
            value={member.yearOfGraduation}
            onChange={(e) => handleMemberChange(index, 'yearOfGraduation', e.target.value)}
            placeholder="e.g. 2024"
          />
        </div>

        <div className="input-group">
          <label>&gt; COURSE_</label>
          <input 
            type="text" 
            required
            value={member.course}
            onChange={(e) => handleMemberChange(index, 'course', e.target.value)}
            placeholder="e.g. B.Tech"
          />
        </div>

        <div className="input-group">
          <label>&gt; SPECIALIZATION_</label>
          <input 
            type="text" 
            required
            value={member.specialization}
            onChange={(e) => handleMemberChange(index, 'specialization', e.target.value)}
            placeholder="e.g. Computer Science"
          />
        </div>

        <div className="input-group">
          <label>&gt; CONTACT NUMBER_</label>
          <input 
            type="tel" 
            required
            value={member.contactNumber}
            onChange={(e) => handleMemberChange(index, 'contactNumber', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>&gt; EMAIL_</label>
          <input 
            type="email" 
            required
            value={member.email}
            onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
          />
        </div>
      </div>
    );
  };

  const totalSteps = numPlayers + 1;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 10
    }}>
      
      {/* Back to Base button */}
      <button 
        onClick={() => navigate('/')}
        className="back-btn"
      >
        &lt; ABORT & RETURN TO BASE
      </button>

      <div className="terminal-form">
        {/* Terminal Header */}
        <div className="terminal-header">
          System Terminal v4.86 // Secure Link // Step {step} of {totalSteps}
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1rem', marginTop: '1rem', color: 'rgba(57, 255, 20, 0.9)' }}>
          REGISTER SQUAD
        </h2>
        
        {/* Progress Bar */}
        <div className="progress-bg">
          <div className="progress-bar" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        
        {error && (
          <div style={{ color: '#ff3333', marginBottom: '1rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={step === totalSteps ? handleSubmit : nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
              <div className="input-group">
                <label>&gt; SQUAD DESIGNATION (TEAM NAME)_</label>
                <input 
                  type="text" 
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>&gt; ASSIGNED SQUAD ID (TEAM NUMBER)_</label>
                <input 
                  type="text" 
                  value={teamNumber}
                  readOnly
                  style={{ color: '#888', borderColor: '#444', cursor: 'not-allowed' }}
                />
              </div>

              <div className="input-group">
                <label>&gt; NUMBER OF OPERATIVES_</label>
                <select 
                  value={numPlayers} 
                  onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(57, 255, 20, 0.5)',
                    color: 'var(--color-accent)',
                    padding: '0.5rem 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={3} style={{ background: '#002729' }}>3 OPERATIVES</option>
                  <option value={4} style={{ background: '#002729' }}>4 OPERATIVES</option>
                  <option value={5} style={{ background: '#002729' }}>5 OPERATIVES</option>
                </select>
              </div>
            </div>
          )}

          {step > 1 && step <= totalSteps && renderMemberForm(step - 2)}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep}
                className="btn-outline"
                disabled={isSubmitting}
              >
                [ BACK ]
              </button>
            ) : (
              <div></div> // Empty div for flex spacing
            )}

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '[ TRANSMITTING... ]' : (step === totalSteps ? '[ SUBMIT ENTRY ]' : '[ PROCEED ]')}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: transparent;
          border: none;
          color: var(--color-accent);
          font-family: var(--font-mono);
          font-size: 1rem;
          cursor: pointer;
          text-transform: uppercase;
        }

        .terminal-form {
          width: 100%;
          max-width: 600px;
          padding: 3rem;
          border: 2px solid rgba(57, 255, 20, 0.5);
          border-radius: 5px;
          background-color: #002729;
          box-shadow: 0 0 30px rgba(57, 255, 20, 0.1);
          position: relative;
        }

        .terminal-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 0.5rem;
          background-color: rgba(57, 255, 20, 0.8);
          color: #000;
          font-weight: bold;
          font-family: var(--font-mono);
          text-align: center;
          text-transform: uppercase;
          font-size: 0.8rem;
        }

        .progress-bg {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          margin-bottom: 2rem;
          position: relative;
        }

        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(57, 255, 20, 0.8);
          transition: width 0.3s ease;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-family: var(--font-mono);
          color: #888;
        }

        .input-group input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(57, 255, 20, 0.5);
          color: var(--color-text);
          padding: 0.5rem 0;
          font-family: var(--font-mono);
          font-size: 1.2rem;
          outline: none;
        }

        .input-group input:focus {
          border-bottom-color: rgba(57, 255, 20, 1);
        }

        .btn-outline {
          padding: 1rem 2rem;
          background: transparent;
          border: 1px solid rgba(155, 168, 168, 0.5);
          color: var(--color-text);
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline:hover:not(:disabled) {
          border-color: var(--color-text);
        }

        .btn-primary {
          padding: 1rem 2rem;
          background: transparent;
          border: 1px solid rgba(57, 255, 20, 0.8);
          color: rgba(57, 255, 20, 0.8);
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: bold;
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(57, 255, 20, 0.8);
          color: #000;
        }

        .btn-primary:disabled, .btn-outline:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RegistrationPage;
