import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  useEffect(() => {
    api.get('/me')
      .then((response) => console.log('dashboard', response))
      .catch(err => console.log(err))
  }, [])

  const { user } = useAuth();
  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {}
  }
})