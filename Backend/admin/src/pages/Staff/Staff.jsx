import React, { useState, useEffect } from 'react';
import './Staff.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Staff = ({ url }) => {
    const [staffList, setStaffList] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [inviteData, setInviteData] = useState({
        name: '', email: '', phone: '', role: 'MANAGER', temporaryPassword: ''
    });

    const [editData, setEditData] = useState({
        id: '', name: '', phone: '', role: 'MANAGER'
    });

    // We assume the token is stored in localStorage by the Admin Login process
    const token = localStorage.getItem('token');

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await axios.get(url + '/api/admin/staff', {
                headers: { token }
            });
            if (response.data.success) {
                setStaffList(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching staff");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleInviteChange = (e) => {
        setInviteData({ ...inviteData, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const submitInvite = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(url + '/api/admin/staff/invite', inviteData, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setShowInviteModal(false);
                fetchStaff();
                setInviteData({ name: '', email: '', phone: '', role: 'MANAGER', temporaryPassword: '' });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error inviting staff");
        }
    };

    const openEditModal = (staff) => {
        setEditData({ id: staff._id, name: staff.name, phone: staff.phone, role: staff.role });
        setShowEditModal(true);
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(url + '/api/admin/staff/' + editData.id, editData, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success("Staff updated successfully");
                setShowEditModal(false);
                fetchStaff();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating staff");
        }
    };

    const deactivateStaff = async (id, currentStatus) => {
        try {
            const response = await axios.put(url + '/api/admin/staff/' + id, { isActive: !currentStatus }, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success("Staff status updated");
                fetchStaff();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating staff");
        }
    };

    const deleteStaff = async (id) => {
        if (!window.confirm("Are you sure you want to completely remove this staff member?")) return;
        try {
            const response = await axios.delete(url + '/api/admin/staff/' + id, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success("Staff deleted");
                fetchStaff();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting staff");
        }
    };

    return (
        <div className="staff-management add">
            <div className="staff-header">
                <h2>Staff Management</h2>
                <button className="invite-btn" onClick={() => setShowInviteModal(true)}>+ Invite Staff</button>
            </div>

            <div className="staff-table-container">
                {loading ? (
                    <div className="loading-skeleton">Loading staff...</div>
                ) : (
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="staff-name-col">
                                            {staff.profileImage ? (
                                                <img src={staff.profileImage} alt="" className="staff-avatar" />
                                            ) : (
                                                <div className="staff-avatar placeholder">{staff.name.charAt(0)}</div>
                                            )}
                                            {staff.name}
                                        </div>
                                    </td>
                                    <td><span className={`role-badge ${staff.role?.toLowerCase()}`}>{staff.role}</span></td>
                                    <td>{staff.email}</td>
                                    <td>{staff.phone}</td>
                                    <td>
                                        <span className={`status-dot ${staff.isActive ? 'active' : 'inactive'}`}></span>
                                        {staff.isActive ? 'Active' : 'Inactive'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => deactivateStaff(staff._id, staff.isActive)} className="btn-toggle">
                                                {staff.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button onClick={() => openEditModal(staff)} className="btn-edit" style={{background: '#1890ff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', margin: '0 5px'}}>Edit</button>
                                            <button onClick={() => deleteStaff(staff._id)} className="btn-delete">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {staffList.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="no-staff">No staff members found. Invite someone to join your team!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Invite New Staff</h3>
                        <form onSubmit={submitInvite}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" name="name" value={inviteData.name} onChange={handleInviteChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={inviteData.email} onChange={handleInviteChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" name="phone" value={inviteData.phone} onChange={handleInviteChange} required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={inviteData.role} onChange={handleInviteChange}>
                                    <option value="MANAGER">Manager</option>
                                    <option value="KITCHEN">Kitchen Staff</option>
                                    <option value="DELIVERY">Delivery Partner</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Temporary Password</label>
                                <input type="text" name="temporaryPassword" value={inviteData.temporaryPassword} onChange={handleInviteChange} minLength={8} required />
                                <small>Staff can change this after logging in.</small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowInviteModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">Send Invitation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Staff</h3>
                        <form onSubmit={submitEdit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" name="name" value={editData.name} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" name="phone" value={editData.phone} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={editData.role} onChange={handleEditChange}>
                                    <option value="MANAGER">Manager</option>
                                    <option value="KITCHEN">Kitchen Staff</option>
                                    <option value="DELIVERY">Delivery Partner</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
