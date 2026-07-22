import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import styles from './EditProfile.module.css';
import toast from "react-hot-toast";
import { PATH } from '../../utils/pathList.ts';

export const EditProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const [vibe, setVibe] = useState(user?.vibe || '');
    const [description, setDescription] = useState(user?.description || '');

    const [file, setFile] = useState<File | null>(null);
    const [upperBanner, setUpperBanner] = useState<File | null>(null);
    const [leftBanner, setLeftBanner] = useState<File | null>(null);
    const [rightBanner, setRightBanner] = useState<File | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.pfp_url || null);
    const [upperPreview, setUpperPreview] = useState<string | null>(user?.upper_banner_url || null);
    const [leftPreview, setLeftPreview] = useState<string | null>(user?.left_banner_url || null);
    const [rightPreview, setRightPreview] = useState<string | null>(user?.right_banner_url || null);

    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const upperInputRef = useRef<HTMLInputElement>(null);
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFileState: (f: File) => void,
        setPreviewState: (url: string) => void
    ) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFileState(selectedFile);
            setPreviewState(URL.createObjectURL(selectedFile));
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
            if (upperBanner) formData.append('upper_banner', upperBanner);
            if (leftBanner) formData.append('left_banner', leftBanner);
            if (rightBanner) formData.append('right_banner', rightBanner);

            await api.post('/users/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate(user?.username ? PATH.authAndUser.href.profile(user.username) : PATH.rooms.rooms);
            toast.success('profile visuals ascended');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Could not update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate(PATH.authAndUser.login);
    };

    return (
        <div className={styles.layout}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>← cancel</button>
                    <h1 className={styles.title}>Edit Profile</h1>
                    <button className={styles.logoutBtn} onClick={handleLogout}>logout</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.visualsEditor}>
                        <div className={`${styles.previewBox} ${styles.sideBannerSize}`} onClick={() => leftInputRef.current?.click()}>
                            {leftPreview ? <img src={leftPreview} className={styles.previewImage} alt="left" /> : <span className={styles.placeholderText}>LEFT BANNER</span>}
                            <div className={styles.overlay}>✎ edit</div>
                        </div>

                        <div className={styles.centerVisuals}>
                            <div className={`${styles.previewBox} ${styles.upperBannerSize}`} onClick={() => upperInputRef.current?.click()}>
                                {upperPreview ? <img src={upperPreview} className={styles.previewImage} alt="upper" /> : <span className={styles.placeholderText}>UPPER BANNER</span>}
                                <div className={styles.overlay}>✎ edit</div>
                            </div>

                            <div className={`${styles.previewBox} ${styles.avatarSize}`} onClick={() => fileInputRef.current?.click()}>
                                {previewUrl ? <img src={previewUrl} className={styles.previewImage} alt="avatar" /> : <span className={styles.placeholderText}>AVATAR</span>}
                                <div className={styles.overlay}>✎ edit</div>
                            </div>
                        </div>

                        <div className={`${styles.previewBox} ${styles.sideBannerSize}`} onClick={() => rightInputRef.current?.click()}>
                            {rightPreview ? <img src={rightPreview} className={styles.previewImage} alt="right" /> : <span className={styles.placeholderText}>RIGHT BANNER</span>}
                            <div className={styles.overlay}>✎ edit</div>
                        </div>

                        <input type="file" accept="image/*" ref={leftInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, setLeftBanner, setLeftPreview)} />
                        <input type="file" accept="image/*" ref={upperInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, setUpperBanner, setUpperPreview)} />
                        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, setFile, setPreviewUrl)} />
                        <input type="file" accept="image/*" ref={rightInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, setRightBanner, setRightPreview)} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Vibe (Status)</label>
                        <input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="e.g. chill af / unbothered" maxLength={50} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="tell them about u kiddo" rows={5} maxLength={300} />
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                        {isLoading ? 'uploading to matrix...' : 'updateprofilemaxxing'}
                    </button>
                </form>
            </div>
        </div>
    );
};
