'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface TaskStatus {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
  progress?: number;
}

interface TaskProgressProps {
  tasks: TaskStatus[];
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
  // ステータスアイコンとスタイル
  const getStatusInfo = (status: TaskStatus['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          iconClass: 'text-yellow-500',
          bgClass: 'bg-yellow-50 border-yellow-200',
          textClass: 'text-yellow-800',
          label: '待機中'
        };
      case 'running':
        return {
          icon: Cog6ToothIcon,
          iconClass: 'text-blue-500 animate-spin',
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-800',
          label: '実行中'
        };
      case 'completed':
        return {
          icon: CheckCircleIcon,
          iconClass: 'text-green-500',
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-800',
          label: '完了'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          iconClass: 'text-red-500',
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-800',
          label: 'エラー'
        };
      default:
        return {
          icon: ClockIcon,
          iconClass: 'text-gray-500',
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-800',
          label: '不明'
        };
    }
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">実行中のタスク</h3>
        <span className="text-sm text-gray-500">
          {tasks.filter(t => t.status === 'completed').length}/{tasks.length} 完了
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const statusInfo = getStatusInfo(task.status);
          const IconComponent = statusInfo.icon;

          return (
            <div
              key={task.id}
              className={`
                border rounded-lg p-4 transition-all duration-200
                ${statusInfo.bgClass}
              `}
            >
              {/* タスクヘッダー */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <IconComponent 
                    className={`w-5 h-5 flex-shrink-0 ${statusInfo.iconClass}`}
                  />
                  <div>
                    <h4 className={`font-medium text-sm ${statusInfo.textClass}`}>
                      {task.title}
                    </h4>
                    {task.details && (
                      <p className="text-xs text-gray-600 mt-1">
                        {task.details}
                      </p>
                    )}
                  </div>
                </div>
                <span 
                  className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${statusInfo.textClass} ${statusInfo.bgClass}
                  `}
                >
                  {statusInfo.label}
                </span>
              </div>

              {/* プログレスバー */}
              {task.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>進捗</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`
                        h-2 rounded-full transition-all duration-500 ease-out
                        ${task.status === 'completed' 
                          ? 'bg-green-500' 
                          : task.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }
                      `}
                      style={{ width: `${Math.max(0, Math.min(100, task.progress))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 実行中のアニメーション */}
              {task.status === 'running' && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-600">
                    処理中...
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 全タスク完了時のメッセージ */}
      {tasks.length > 0 && tasks.every(task => task.status === 'completed') && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">
              すべてのタスクが完了しました！
            </span>
          </div>
        </div>
      )}

      {/* エラーがある場合の警告 */}
      {tasks.some(task => task.status === 'error') && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">
              一部のタスクでエラーが発生しました
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 