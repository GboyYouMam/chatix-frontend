import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './ProfileCommentsSection.module.css';
import { usersApi } from '../../api/users/users.service.ts';
import type { ProfileComment } from '../../api/users/types.ts';

interface ProfileCommentsSectionProps {
    profileUsername: string;
    initialComments: ProfileComment[];
    canInteractWithProfile: boolean;
}

export const ProfileCommentsSection = ({
    profileUsername,
    initialComments,
    canInteractWithProfile,
}: ProfileCommentsSectionProps) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState(initialComments);
    const [commentBody, setCommentBody] = useState('');
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

    useEffect(() => {
        setComments(initialComments);
        setCommentBody('');
    }, [initialComments, profileUsername]);

    const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canInteractWithProfile || isCommentSubmitting) return;

        const cleanBody = commentBody.trim();
        if (!cleanBody) return;

        setIsCommentSubmitting(true);
        try {
            const response = await usersApi.createProfileComment(profileUsername, cleanBody);
            setComments((prev) => [response.comment, ...prev]);
            setCommentBody('');
            toast('comment added');
        } catch (error) {
            console.error('Failed to add profile comment:', error);
            toast.error('could not add comment');
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    const handleAuthorClick = (commentAuthorUsername?: string) => {
        if (!commentAuthorUsername) return;
        navigate(`/profile/${commentAuthorUsername}`);
    };

    return (
        <section className={styles.commentsBox}>
            <div className={styles.commentsHeader}>
                <h3 className={styles.descTitle}>profile comments</h3>
                <span className={styles.commentCount}>{comments.length}</span>
            </div>

            {canInteractWithProfile && (
                <form className={styles.commentForm} onSubmit={handleCreateComment}>
                    <textarea
                        className={styles.commentInput}
                        value={commentBody}
                        onChange={(event) => setCommentBody(event.target.value)}
                        placeholder="leave a comment"
                        maxLength={500}
                        rows={3}
                        disabled={isCommentSubmitting}
                    />
                    <button
                        className={styles.commentSubmit}
                        type="submit"
                        disabled={isCommentSubmitting || !commentBody.trim()}
                    >
                        {isCommentSubmitting ? 'posting...' : 'post comment'}
                    </button>
                </form>
            )}

            <div className={styles.commentsList}>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <article className={styles.commentItem} key={comment.id}>
                            <div className={styles.commentMeta}>
                                <button
                                    className={styles.commentAuthor}
                                    type="button"
                                    onClick={() => handleAuthorClick(comment.author?.username)}
                                >
                                    {comment.author?.username ?? 'unknown'}
                                </button>
                                <span>{new Date(comment.createdAt).toLocaleDateString('uk-UA')}</span>
                            </div>
                            <p className={styles.commentBody}>{comment.body}</p>
                        </article>
                    ))
                ) : (
                    <p className={styles.noComments}>no comments yet</p>
                )}
            </div>
        </section>
    );
};
