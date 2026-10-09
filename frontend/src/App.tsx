import { Outlet } from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <div>
      <Header />
      <main className="pt-16 flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
