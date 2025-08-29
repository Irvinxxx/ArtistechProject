import { useLocation, useNavigate } from 'react-router-dom';
import SignupModal from '../components/SignupModal';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  return (
    <SignupModal
      isOpen={true}
      onClose={() => navigate(from, { replace: true })}
      onSwitchToLogin={() => navigate('/login', { state: { from } })}
    />
  );
};

export default SignupPage; 