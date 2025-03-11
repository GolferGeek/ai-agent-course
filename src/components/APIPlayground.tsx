import React, { useState, useRef } from 'react';
import styles from './APIPlayground.module.css';

interface Parameter {
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  items?: {
    type: string;
  };
  properties?: Record<string, Parameter>;
  mimeTypes?: string[];
}

interface APIMetadata {
  name: string;
  endpoint: string;
  description: string;
  method: string;
  parameters: Record<string, Parameter>;
  responses: {
    [key: string]: {
      description: string;
      content?: Record<string, {
        type: string;
        description: string;
      }>;
    };
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  action?: string;
}

const renderResponseValue = (value: any): JSX.Element => {
  if (value === null) return <span className={styles.nullValue}>null</span>;
  if (typeof value === 'boolean') return <span className={styles.booleanValue}>{value.toString()}</span>;
  if (typeof value === 'number') return <span className={styles.numberValue}>{value}</span>;
  if (typeof value === 'string') return <span className={styles.stringValue}>{value}</span>;
  if (Array.isArray(value)) {
    return (
      <div className={styles.arrayValue}>
        {value.map((item, index) => (
          <div key={index} className={styles.arrayItem}>
            {renderResponseValue(item)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className={styles.objectValue}>
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className={styles.responseField}>
            <div className={styles.responseLabel}>{key}:</div>
            <div className={styles.responseValue}>{renderResponseValue(val)}</div>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
};

const APIPlayground = ({ metadata }: { metadata: APIMetadata }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const isReactAPI = metadata.endpoint.includes('/api/langchain/react');

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderInput = (name: string, param: Parameter) => {
    // For ReAct API, render a chat-style input
    if (isReactAPI && name === 'message') {
      return (
        <input
          ref={inputRef}
          type="text"
          value={formData[name] || ''}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          required={param.required}
          placeholder="Type your message..."
          className={styles.chatInput}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      );
    }

    // Default input rendering for other APIs
    switch (param.type) {
      case 'string':
        if (param.enum) {
          return (
            <select
              value={formData[name] || ''}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              required={param.required}
              className={styles.select}
            >
              <option value="">Select {name}</option>
              {param.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={formData[name] || ''}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={param.required}
            placeholder={param.description}
            className={styles.input}
          />
        );

      case 'array':
        return (
          <textarea
            value={formData[name] ? JSON.stringify(formData[name], null, 2) : ''}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                setFormData({ ...formData, [name]: value });
                setError(null);
              } catch (err) {
                setError('Invalid JSON array format');
              }
            }}
            required={param.required}
            placeholder={`Enter JSON array for ${name}`}
            className={styles.textarea}
          />
        );

      case 'object':
        return (
          <textarea
            value={formData[name] ? JSON.stringify(formData[name], null, 2) : ''}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                setFormData({ ...formData, [name]: value });
                setError(null);
              } catch (err) {
                setError('Invalid JSON object format');
              }
            }}
            required={param.required}
            placeholder={`Enter JSON object for ${name}`}
            className={styles.textarea}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && param.mimeTypes?.includes(file.type)) {
                setFormData({ ...formData, [name]: file });
                setError(null);
              } else {
                setError(`Invalid file type. Allowed types: ${param.mimeTypes?.join(', ')}`);
              }
            }}
            accept={param.mimeTypes?.join(',')}
            required={param.required}
            className={styles.fileInput}
          />
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestBody = JSON.stringify(formData);
      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(metadata.endpoint, {
        method: metadata.method,
        body: metadata.method === 'GET' ? undefined : requestBody,
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }
      
      setResponse(data);

      // Handle chat-specific updates for ReAct API
      if (isReactAPI && formData.message) {
        const newUserMessage: ChatMessage = {
          role: 'user',
          content: formData.message
        };

        const newAssistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          thought: data.thought,
          action: data.action
        };

        setChatHistory(prev => [...prev, newUserMessage, newAssistantMessage]);
        setFormData({ message: '' }); // Clear input after sending
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.metadata}>
        <h2>{metadata.name}</h2>
        <p className={styles.description}>{metadata.description}</p>
        <div className={styles.endpoint}>
          <span className={styles.method}>{metadata.method}</span>
          <span className={styles.url}>{metadata.endpoint}</span>
        </div>
      </div>

      {isReactAPI && chatHistory.length > 0 && (
        <div className={styles.chatHistory}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
              <div className={styles.messageContent}>{msg.content}</div>
              {msg.thought && (
                <div className={styles.thought}>
                  <strong>Thought:</strong> {msg.thought}
                </div>
              )}
              {msg.action && (
                <div className={styles.action}>
                  <strong>Action:</strong> {msg.action}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${styles.form} ${isReactAPI ? styles.chatForm : ''}`}>
        {Object.entries(metadata.parameters).map(([name, param]) => (
          <div key={name} className={styles.field}>
            {!isReactAPI && (
              <label className={styles.label}>
                {name}
                {param.required && <span className={styles.required}>*</span>}
              </label>
            )}
            <div className={styles.inputWrapper}>
              {renderInput(name, param)}
              {!isReactAPI && <small className={styles.description}>{param.description}</small>}
            </div>
          </div>
        ))}

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} className={`${styles.button} ${isReactAPI ? styles.chatButton : ''}`}>
          {loading ? 'Sending...' : isReactAPI ? 'Send' : 'Send Request'}
        </button>
      </form>

      {!isReactAPI && response && (
        <div className={styles.response}>
          <h3>Response</h3>
          {renderResponseValue(response)}
        </div>
      )}
    </div>
  );
};

export default APIPlayground; 