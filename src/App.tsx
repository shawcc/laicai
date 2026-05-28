import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Admin } from '@/pages/Admin';
import { AiPlayers } from '@/pages/AiPlayers';
import { Home } from '@/pages/Home';
import { Intelligence } from '@/pages/Intelligence';
import { Leaderboard } from '@/pages/Leaderboard';
import { QuestionDetail } from '@/pages/QuestionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/questions/:questionId" element={<QuestionDetail />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/ai-players" element={<AiPlayers />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
