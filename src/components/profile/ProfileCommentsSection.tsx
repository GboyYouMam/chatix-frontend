import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { notify } from '../../lib/toast';
import { formatDate } from '../../utils/date.ts';
import styles from './ProfileCommentsSection.module.css';
import { usersApi } from '../../api/users/users.service.ts';
import type { ProfileComment } from '../../api/users/types.ts';
import { PATH } from '../../utils/pathList.ts';

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

    const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canInteractWithProfile || isCommentSubmitting) return;

        const cleanBody = commentBody.trim();
        if (!cleanBody) return;

        setIsCommentSubmitting(true);
        try {
            await usersApi.createProfileComment(profileUsername, cleanBody);
            setComments(await usersApi.getProfileComments(profileUsername));
            setCommentBody('');
            notify.success('comment added');
        } catch (error) {
            notify.error(error);
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    const handleAuthorClick = (commentAuthorUsername?: string) => {
        if (!commentAuthorUsername) return;
        navigate(PATH.authAndUser.href.profile(commentAuthorUsername));
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
                                <span>{formatDate(comment.createdAt)}</span>
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
