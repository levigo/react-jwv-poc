package org.jadice.jwv.poc.react;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

import com.levigo.jadice.web.server.spring.JWTSpringConfiguration;
import com.levigo.jadice.web.server.spring.SpringPropertiesServerConfiguration;
import com.levigo.jadice.web.server.spring.autoconfig.JWTSpringComponentScan;


@SpringBootApplication
@Import({JWTSpringConfiguration.class, SpringPropertiesServerConfiguration.class, JWTSpringComponentScan.class})
public class JadiceWebViewerApplication {
    public static void main(String[] args) {
        SpringApplication.run(JadiceWebViewerApplication.class, args);
    }
}
