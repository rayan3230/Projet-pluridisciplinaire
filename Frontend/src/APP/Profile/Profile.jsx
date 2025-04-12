import Adminnav from '../../components/Appnavbar/Appnavbar.jsx'
import profile from '../../assets/profile.png';
import './Profile.css';

import { useState, useEffect } from 'react';

function Profile({ Name, Email, Phone, Department, Year, Branch }) {
    const [profileData, setProfileData] = useState({
        Name,
        Email,
        Phone,
        Department,
        Year,
        Branch,
    });

    useEffect(() => {
        setProfileData({ Name, Email, Phone, Department, Year, Branch });
    }, [Name, Email, Phone, Department, Year, Branch]);

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
                        <p>Department: {profileData.Department}</p>
                        <p>Assigned Courses: {profileData.AssignedCourses}</p>
                    </div>
                    <div className='buttons'>
                        <button id="edit-profile-button">Edit Profile</button>
                        <button id="current-schedule-button">Current schedule</button>
                        <button id="delete-profile-button">Delete Profile</button>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Profile;