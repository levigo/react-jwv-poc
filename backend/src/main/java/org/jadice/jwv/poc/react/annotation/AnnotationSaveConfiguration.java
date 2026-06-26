package org.jadice.jwv.poc.react.annotation;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Configuration properties for annotation saving functionality.
 * <p>
 * Properties are bound from the application configuration with the prefix
 * "annotation.save". They define the HTTP endpoint, connection parameters and
 * authentication details used when persisting annotations to a remote server
 * (here the local test-server-basic-auth on port 3000).
 * </p>
 */
@Setter
@Getter
@Configuration
@ToString
@ConfigurationProperties(prefix = "annotation.save")
public class AnnotationSaveConfiguration {
    private String baseUrl;
    private int connectTimeout = 30;
    private int requestTimeout = 30;
    private AuthenticationConfig authentication;

    @Setter
    @Getter
    @ToString
    public static class AuthenticationConfig {
        private String username;
        private String password;
        private String token;
    }
}
