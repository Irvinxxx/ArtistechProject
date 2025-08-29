import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  return (
    <LoginModal
      isOpen={true}
      onClose={() => navigate(from, { replace: true })}
      onSwitchToSignup={() => navigate('/signup', { state: { from } })}
    />
  );
};

export default LoginPage; 