import { Navigate, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();

  if (!auth || !auth.isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
