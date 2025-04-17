import Adminnav from '../../components/Appnavbar/Appnavbar.jsx'
import profile from '../../assets/profile.png';
import './Profile.css';
import Editprofile from '../../components/Editprofile/Editprofile.jsx';

import { useState, useEffect } from 'react';

// Placeholder list of all possible modules
const allAvailableModules = ['Calculus I', 'Linear Algebra', 'Data Structures', 'Algorithms', 'Operating Systems', 'Database Management', 'Web Development', 'Software Engineering'];

function Profile({ Name="Default Name", Email="default@example.com", Matricule="N/A", Department="N/A", AssignedCourses=['Calculus I'] }) {
    const [profileData, setProfileData] = useState({
        Name,
        Email,
        Matricule,
        Department,
        AssignedCourses,
    });
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        setProfileData({ Name, Email, Matricule, Department, AssignedCourses });
    }, [Name, Email, Matricule, Department, AssignedCourses]);

    const handleOpenEditModal = () => {
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    return (
        <>
            <Adminnav />
            <div className='containerprofile'>
                <div className='leftprofile'>
                    <img src={profile} alt="Profile" id='profile' />
                    <div className="name">
                        <h1>{profileData.Name}</h1>
                        <p>{profileData.Email}</p>
                    </div>
                    
                    <div className='buttons'>
                        <button id="update-image-button">Update image</button>
                        <button id="remove-image-button">Remove image</button>
                    </div>
                </div>
                <div className='rightprofile'>
                <h1>Personal Information</h1>
                    <div className='information'>
                        <p>Name: {profileData.Name}</p>
                        <p>Matricule: {profileData.Matricule}</p>
                        <p>Email: {profileData.Email}</p>
                        <p>Assigned Courses: {Array.isArray(profileData.AssignedCourses) ? profileData.AssignedCourses.join(', ') : 'None'}</p>
                    </div>
                    <div className='buttons'>
                        <button id="edit-profile-button" onClick={handleOpenEditModal}>Edit Profile</button>
                        <button id="current-schedule-button">Current schedule</button>
                        <button id="delete-profile-button">Delete Profile</button>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <Editprofile 
                    user={profileData} 
                    onClose={handleCloseEditModal} 
                    availableModules={allAvailableModules}
                />
            )}
        </>
    );
}
export default Profile;