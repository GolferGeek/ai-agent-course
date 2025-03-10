import React, { useState } from 'react';
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

  const renderInput = (name: string, param: Parameter) => {
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
    setResponse(null);

    try {
      // Check if we have any file inputs
      const hasFiles = Object.values(formData).some(value => value instanceof File);

      let requestBody;
      let headers: Record<string, string> = {};

      if (hasFiles) {
        // Use FormData for file uploads
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value instanceof File) {
            form.append(key, value);
          } else if (typeof value === 'object') {
            form.append(key, JSON.stringify(value));
          } else {
            form.append(key, value);
          }
        });
        requestBody = form;
      } else {
        // Use JSON for regular requests
        requestBody = JSON.stringify(formData);
        headers['Content-Type'] = 'application/json';
      }

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

      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.entries(metadata.parameters).map(([name, param]) => (
          <div key={name} className={styles.field}>
            <label className={styles.label}>
              {name}
              {param.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.inputWrapper}>
              {renderInput(name, param)}
              <small className={styles.description}>{param.description}</small>
            </div>
          </div>
        ))}

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {response && (
        <div className={styles.response}>
          <h3>Response</h3>
          <div className={styles.responseContent}>
            {renderResponseValue(response)}
          </div>
          <details className={styles.rawResponse}>
            <summary>Raw Response</summary>
            <pre>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default APIPlayground; 