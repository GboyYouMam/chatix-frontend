import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '../../lib/toast';
import { formatDate } from '../../utils/date.ts';
import styles from './ProfileCommentsSection.module.css';
import { usersApi } from '../../api/users/users.service.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { PATH } from '../../utils/pathList.ts';
import { GUESTBOOK_PAGE_SIZE } from './guestbookPaging.ts';
import { GuestbookPager } from './GuestbookPager.tsx';

interface ProfileCommentsSectionProps {
    profileUsername: string;
    canInteractWithProfile: boolean;
}

export const ProfileCommentsSection = ({
    profileUsername,
    canInteractWithProfile,
}: ProfileCommentsSectionProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [commentBody, setCommentBody] = useState('');
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

    // keepPreviousData keeps the current page on screen while the next one loads, so there is no flicker.
    const commentsQuery = useQuery({
        queryKey: queryKeys.profileComments(profileUsername, page),
        queryFn: () => usersApi.getProfileComments(profileUsername, page, GUESTBOOK_PAGE_SIZE),
        placeholderData: keepPreviousData,
    });
    const comments = commentsQuery.data?.items ?? [];
    const total = commentsQuery.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / GUESTBOOK_PAGE_SIZE));

    const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canInteractWithProfile || isCommentSubmitting) return;

        const cleanBody = commentBody.trim();
        if (!cleanBody) return;

        setIsCommentSubmitting(true);
        try {
            await usersApi.createProfileComment(profileUsername, cleanBody);
            setCommentBody('');
            // A new comment is the newest entry, so show page 1 and refetch every cached page.
            setPage(1);
            await queryClient.invalidateQueries({ queryKey: ['profileComments', profileUsername] });
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

    const renderList = () => {
        if (commentsQuery.isError) {
            return <p className={styles.noComments}>the wall fell over. try again.</p>;
        }
        if (commentsQuery.isPending) {
            return <p className={styles.noComments}>reading the wall...</p>;
        }
        if (comments.length === 0) {
            return <p className={styles.noComments}>no comments yet</p>;
        }
        return comments.map((comment) => (
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
        ));
    };

    return (
        <section className={styles.commentsBox}>
            <div className={styles.commentsHeader}>
                <h3 className={styles.descTitle}>profile comments</h3>
                <span className={styles.commentCount}>{commentsQuery.data ? total : '...'}</span>
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

            <div className={styles.commentsList}>{renderList()}</div>

            {total > 0 && (
                <GuestbookPager
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    onPageChange={setPage}
                />
            )}
        </section>
    );
};
