import { useQuery } from '@tanstack/react-query';
import { fetchAllCommentTaskIds } from '../api/commentsApi';

export const commentCountsKey = ['commentCounts'];

/**
 * Comment counts per task: { [taskId]: number }. Used to show a comment badge
 * on task rows. Invalidated by TaskCommentThread whenever a comment is
 * created or deleted.
 */
export const useCommentCounts = () =>
  useQuery({
    queryKey: commentCountsKey,
    queryFn: async () => {
      const rows = await fetchAllCommentTaskIds();
      return rows.reduce((counts, row) => {
        counts[row.task_id] = (counts[row.task_id] || 0) + 1;
        return counts;
      }, {});
    },
  });
