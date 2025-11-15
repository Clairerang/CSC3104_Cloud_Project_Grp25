import mqtt, { MqttClient } from 'mqtt';
import { useCallback, useEffect, useRef } from 'react';

interface NotificationEvent {
  type: string;
  userId: string;
  target: string[];
  timestamp: string;
  [key: string]: any;
}

interface UseRealtimeUpdatesOptions {
  onEvent?: (event: NotificationEvent) => void;
  enabled?: boolean;
}

const MQTT_BROKER_WS_URL = 'ws://localhost:8000'; // HiveMQ WebSocket port

export const useRealtimeUpdates = (options: UseRealtimeUpdatesOptions = {}) => {
  const { onEvent, enabled = true } = options;
  const clientRef = useRef<MqttClient | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!enabled || clientRef.current) {
      return;
    }

    console.log('[MQTT] Connecting to', MQTT_BROKER_WS_URL);                                                

    try {
      const client = mqtt.connect(MQTT_BROKER_WS_URL, {
        clientId: `dashboard-${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
      });

      client.on('connect', () => {
        console.log('✅ [MQTT] Connected to broker');
        isConnectedRef.current = true;

        // Subscribe to notification events
        client.subscribe('notification/events', { qos: 1 }, (err) => {
          if (err) {
            console.error('❌ [MQTT] Subscription error:', err);
          } else {
            console.log('📡 [MQTT] Subscribed to notification/events');
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          const event: NotificationEvent = JSON.parse(message.toString());
          console.log('📨 [MQTT] Received event:', event.type, event);

          // Only process events targeting dashboard
          if (event.target && event.target.includes('dashboard')) {
            onEvent?.(event);
          }
        } catch (error) {
          console.error('❌ [MQTT] Error parsing message:', error);
        }
      });

      client.on('error', (error) => {
        console.error('❌ [MQTT] Connection error:', error);
        isConnectedRef.current = false;
      });

      client.on('close', () => {
        console.log('🔌 [MQTT] Connection closed');
        isConnectedRef.current = false;
      });

      client.on('reconnect', () => {
        console.log('🔄 [MQTT] Reconnecting...');
      });

      clientRef.current = client;
    } catch (error) {
      console.error('❌ [MQTT] Failed to create client:', error);
    }
  }, [enabled, onEvent]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('[MQTT] Disconnecting...');
      clientRef.current.end();
      clientRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
  };
};
