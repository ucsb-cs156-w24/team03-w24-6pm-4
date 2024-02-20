import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import UCSBDatesIndexPage from "main/pages/UCSBDates/UCSBDatesIndexPage";
import UCSBDatesCreatePage from "main/pages/UCSBDates/UCSBDatesCreatePage";
import UCSBDatesEditPage from "main/pages/UCSBDates/UCSBDatesEditPage";


import UCSBorganisationIndexPage from "main/pages/UCSBorganisation/UCSBorganisationIndexPage";
import UCSBorganisationCreatePage from "main/pages/UCSBorganisation/UCSBorganisationCreatePage";
import UCSBorganisationEditPage from "main/pages/UCSBorganisation/UCSBorganisationEditPage";


import RestaurantIndexPage from "main/pages/Restaurants/RestaurantIndexPage";
import RestaurantCreatePage from "main/pages/Restaurants/RestaurantCreatePage";
import RestaurantEditPage from "main/pages/Restaurants/RestaurantEditPage";


import ArticlesIndexPage from 'main/pages/Articles/ArticlesIndexPage';
import ArticlesCreatePage from 'main/pages/Articles/ArticlesCreatePage';
import ArticlesEditPage from 'main/pages/Articles/ArticlesEditPage';


import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";


function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />
        {
          hasRole(currentUser, "ROLE_ADMIN") && <Route exact path="/admin/users" element={<AdminUsersPage />} />
        }

        {
          hasRole(currentUser, "ROLE_USER") && (
            <>
              <Route exact path="/ucsbdates" element={<UCSBDatesIndexPage />} />
            </>
          )
        }
        {
          hasRole(currentUser, "ROLE_ADMIN") && (
            <>
              <Route exact path="/ucsbdates/edit/:id" element={<UCSBDatesEditPage />} />
              <Route exact path="/ucsbdates/create" element={<UCSBDatesCreatePage />} />
            </>
          )
        }
        {
          hasRole(currentUser, "ROLE_USER") && (
            <>
              <Route exact path="/restaurants" element={<RestaurantIndexPage />} />
            </>
          )
        }
        {
          hasRole(currentUser, "ROLE_ADMIN") && (
            <>
              <Route exact path="/restaurants/edit/:id" element={<RestaurantEditPage />} />
              <Route exact path="/restaurants/create" element={<RestaurantCreatePage />} />
            </>
          )
        }

        {
          hasRole(currentUser, "ROLE_USER") && (
            <>
              <Route exact path="/UCSBOrganization" element={<UCSBorganisationIndexPage />} />
            </>
          )
        }
        {
          hasRole(currentUser, "ROLE_ADMIN") && (
            <>
              <Route exact path="/UCSBOrganization/edit/:orgCode" element={<UCSBorganisationEditPage />} />
              <Route exact path="/UCSBOrganization/create" element={<UCSBorganisationCreatePage />} />
            </>
          )
        }

        {
          hasRole(currentUser, 'ROLE_USER') && (
          <>
            <Route exact path="/articles" element={<ArticlesIndexPage />} />
          </>
          )
        }
        {
          hasRole(currentUser, 'ROLE_ADMIN') && (
          <>
            <Route exact path="/articles/edit/:id" element={<ArticlesEditPage />}/>
            <Route exact path="/articles/create" element={<ArticlesCreatePage />}/>
          </>
          )
        }


      </Routes>
    </BrowserRouter>
  );
}

export default App;