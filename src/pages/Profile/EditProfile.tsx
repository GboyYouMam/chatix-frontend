import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import styles from './EditProfile.module.css';
import toast from "react-hot-toast";

export const EditProfile = () => {
    const navigate = useNavigate();

    const { user, logout } = useAuthStore();

    const [vibe, setVibe] = useState(user?.vibe || '');
    const [description, setDescription] = useState(user?.description || '');

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.pfp_url || null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            if (vibe) formData.append('vibe', vibe);
            if (description) formData.append('description', description);
            if (file) formData.append('file', file);

            await api.post('/users/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate(`/profile/${user?.username}`);
            toast('well done sigma');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Could not update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.layout}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← cancel
                    </button>
                    <h1 className={styles.title}>Edit Profile</h1>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        logout
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.avatarSection}>
                        <div
                            className={styles.avatarPreview}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className={styles.avatarImage} />
                            ) : (
                                <span className={styles.avatarPlaceholder}>Upload Avatar</span>
                            )}
                            <div className={styles.avatarOverlay}>✎ change</div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Vibe (Status)</label>
                        <input
                            type="text"
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="e.g. chill af / unbothered"
                            maxLength={50}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="tell them about u kiddo"
                            rows={5}
                            maxLength={300}
                        />
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                        {isLoading ? 'saving...' : 'updateprofilemaxxing'}
                    </button>
                </form>
            </div>
        </div>
    );
};