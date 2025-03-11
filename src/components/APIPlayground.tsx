import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { APIMetadata } from '@/utils/discovery';
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
}

const renderResponseValue = (value: any) => {
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

const LoadingSpinner = () => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner}></div>
    <div className={styles.spinnerText}>Waiting for response...</div>
  </div>
);

interface APIPlaygroundProps {
  metadata: APIMetadata;
}

const APIPlayground: React.FC<APIPlaygroundProps> = ({ metadata }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stateValues, setStateValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear form on mount
  useEffect(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
  }, []);

  // Clear response, error, and state values when metadata (selected API) changes
  useEffect(() => {
    setResponse(null);
    setError(null);
    setStateValues({});
    if (formRef.current) {
      formRef.current.reset();
    }
  }, [metadata.endpoint]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const requestData: Record<string, any> = {};

    // Add form parameters
    for (const [key, value] of formData.entries()) {
      requestData[key] = value;
    }

    // Add persisted state values
    if (metadata.state) {
      Object.entries(metadata.state).forEach(([key, stateVar]) => {
        if (stateVar.persist && stateValues[key]) {
          requestData[key] = stateValues[key];
        }
      });
    }

    try {
      const res = await fetch(metadata.endpoint, {
        method: metadata.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      setResponse(data);

      // Update state values from response
      if (metadata.state) {
        const newStateValues = { ...stateValues };
        Object.entries(metadata.state).forEach(([key, stateVar]) => {
          if (data[stateVar.key]) {
            newStateValues[key] = data[stateVar.key];
          }
        });
        setStateValues(newStateValues);
      }

      // Clear form after successful submission
      formRef.current.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const hasState = metadata.state && Object.keys(metadata.state).length > 0;

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

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        {metadata.parameters && Object.entries(metadata.parameters).map(([key, param]) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>
              {key}
              {param.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id={key}
                name={key}
                required={param.required}
                className={styles.input}
                placeholder={param.description}
              />
              <small className={styles.description}>{param.description}</small>
            </div>
          </div>
        ))}

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {isLoading && <LoadingSpinner />}

      {response && !isLoading && (
        <div className={styles.response}>
          <h3>Response</h3>
          {renderResponseValue(response)}
        </div>
      )}
    </div>
  );
};

export default APIPlayground; 